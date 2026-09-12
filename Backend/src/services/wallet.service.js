import DriverWallet from "../models/DriverWallet.js";
import WalletTransaction from "../models/WalletTransaction.js";
import DriverProfile from "../models/DriverProfile.js";
import User from "../models/User.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";
import { notifyUser } from "./notification.service.js";

export const creditWallet = async (
  driverId,
  amount,
  bookingId,
  description = "Ride Earnings",
  session = null
) => {
  const opts = session ? { session } : {};
  const referenceId = bookingId ? bookingId.toString() : null;

  // Check idempotency first: if a transaction for this booking already exists,
  // return the current wallet state without modifying anything.
  if (referenceId) {
    const existing = await WalletTransaction.findOne(
      { driver: driverId, referenceId },
      null,
      opts
    ).lean();
    if (existing) {
      return await DriverWallet.findOne({ driver: driverId }, null, opts);
    }
  }

  // Step 1: Upsert the wallet document (create if missing).
  const wallet = await DriverWallet.findOneAndUpdate(
    { driver: driverId },
    {
      $setOnInsert: {
        driver: driverId,
        balance: 0,
        lifetimeEarnings: 0,
        totalWithdrawn: 0,
        pendingWithdrawal: 0,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, ...opts }
  );

  // Step 2: Atomically increment balance and lifetimeEarnings. Using $inc
  // ensures the increment is atomic at the storage engine level, avoiding the
  // read-modify-save race on standalone MongoDB.
  const updated = await DriverWallet.findOneAndUpdate(
    { _id: wallet._id },
    { $inc: { balance: amount, lifetimeEarnings: amount } },
    { new: true, ...opts }
  );

  const balanceBefore = updated.balance - amount;

  try {
    await WalletTransaction.create(
      [
        {
          driver: driverId,
          wallet: wallet._id,
          type: "Ride",
          amount,
          balanceBefore,
          balanceAfter: updated.balance,
          booking: bookingId,
          referenceId,
          description,
          status: "Completed",
        },
      ],
      opts
    );
  } catch (err) {
    // Duplicate credit attempt (concurrent request / retry) — roll back the
    // balance change we just made and return the wallet as-is.
    if (err && err.code === 11000) {
      await DriverWallet.updateOne(
        { _id: wallet._id },
        { $inc: { balance: -amount, lifetimeEarnings: -amount } },
        opts
      );
      return await DriverWallet.findOne({ driver: driverId }, null, opts);
    }
    throw err;
  }

  return updated;
};

export const tipDriver = async (driverId, bookingId, amount, session = null) => {
  const opts = session ? { session } : {};
  const referenceId = bookingId ? `tip:${bookingId.toString()}` : null;

  // Idempotency: check if this tip was already credited
  if (referenceId) {
    const existing = await WalletTransaction.findOne(
      { driver: driverId, referenceId },
      null,
      opts
    ).lean();
    if (existing) {
      return await DriverWallet.findOne({ driver: driverId }, null, opts);
    }
  }

  // Step 1: Upsert the wallet document
  const wallet = await DriverWallet.findOneAndUpdate(
    { driver: driverId },
    {
      $setOnInsert: {
        driver: driverId,
        balance: 0,
        lifetimeEarnings: 0,
        totalWithdrawn: 0,
        pendingWithdrawal: 0,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, ...opts }
  );

  // Step 2: Atomic increment
  const updated = await DriverWallet.findOneAndUpdate(
    { _id: wallet._id },
    { $inc: { balance: amount, lifetimeEarnings: amount } },
    { new: true, ...opts }
  );

  const balanceBefore = updated.balance - amount;

  try {
    await WalletTransaction.create(
      [
        {
          driver: driverId,
          wallet: wallet._id,
          type: "Tip",
          amount,
          balanceBefore,
          balanceAfter: updated.balance,
          booking: bookingId,
          referenceId,
          description: "Customer Tip",
          status: "Completed",
        },
      ],
      opts
    );
  } catch (err) {
    if (err && err.code === 11000) {
      await DriverWallet.updateOne(
        { _id: wallet._id },
        { $inc: { balance: -amount, lifetimeEarnings: -amount } },
        opts
      );
      return await DriverWallet.findOne({ driver: driverId }, null, opts);
    }
    throw err;
  }

  const driver = await DriverProfile.findById(driverId, null, opts);
  if (driver) {
    driver.totalTips += amount;
    await driver.save(opts);

    await notifyUser({
      user: driver.user,
      title: "Tip Received",
      message: `You received a ₹${amount} tip from your customer.`,
      type: "Wallet",
      booking: bookingId,
      data: { amount },
    });
  }

  return updated;
};

export const getWalletTransactions = async (driverId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    WalletTransaction.find({ driver: driverId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("booking", "pickup drop bookingStatus")
      .lean(),
    WalletTransaction.countDocuments({ driver: driverId }),
  ]);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const requestWithdrawal = async (userId, data) => {
  const driver = await DriverProfile.findOne({ user: userId }).populate("user", "name");
  if (!driver) throw new Error("Driver not found.");

  const wallet = await DriverWallet.findOne({ driver: driver._id });
  if (!wallet) throw new Error("Wallet not found.");

  if (!data.amount || data.amount <= 0) throw new Error("Invalid amount.");
  if (wallet.balance < data.amount) throw new Error("Insufficient wallet balance.");

  const request = await WithdrawalRequest.create({
    driver: driver._id,
    wallet: wallet._id,
    amount: data.amount,
    bankName: data.bankName,
    accountHolder: data.accountHolder,
    accountNumber: data.accountNumber,
    ifscCode: data.ifscCode,
  });

  wallet.pendingWithdrawal += data.amount;
  await wallet.save();

  const admin = await User.findOne({ role: "admin" });
  if (admin) {
    await notifyUser({
      user: admin._id,
      title: "New Withdrawal Request",
      message: `${driver.user.name} requested a withdrawal of ₹${data.amount}.`,
      type: "Withdrawal",
      data: { withdrawalId: request._id, amount: data.amount },
    });
  }

  return request;
};

export const approveWithdrawal = async (requestId) => {
  const request = await WithdrawalRequest.findById(requestId);
  if (!request) throw new Error("Withdrawal request not found.");
  if (request.status !== "Pending") throw new Error("This request has already been processed.");

  const wallet = await DriverWallet.findById(request.wallet);
  if (!wallet) throw new Error("Wallet not found.");
  if (wallet.balance < request.amount) throw new Error("Insufficient wallet balance.");

  const balanceBefore = wallet.balance;

  wallet.balance -= request.amount;
  wallet.totalWithdrawn += request.amount;
  wallet.pendingWithdrawal = Math.max(0, wallet.pendingWithdrawal - request.amount);
  await wallet.save();

  await WalletTransaction.create({
    driver: request.driver,
    wallet: wallet._id,
    type: "Withdrawal",
    amount: -request.amount,
    balanceBefore,
    balanceAfter: wallet.balance,
    description: "Withdrawal Approved",
    status: "Completed",
    referenceId: request._id.toString(),
  });

  request.status = "Approved";
  request.approvedAt = new Date();
  await request.save();

  const driver = await DriverProfile.findById(request.driver).populate("user", "name");
  if (driver) {
    await notifyUser({
      user: driver.user._id,
      title: "Withdrawal Approved",
      message: `Your withdrawal request of ₹${request.amount} has been approved.`,
      type: "Wallet",
      data: { withdrawalId: request._id, amount: request.amount },
    });
  }

  return request;
};

export const rejectWithdrawalRequest = async (requestId, remarks) => {
  const request = await WithdrawalRequest.findById(requestId);
  if (!request) throw new Error("Withdrawal request not found.");
  if (request.status !== "Pending") throw new Error("This request has already been processed.");

  const wallet = await DriverWallet.findById(request.wallet);
  if (wallet) {
    wallet.pendingWithdrawal = Math.max(0, wallet.pendingWithdrawal - request.amount);
    await wallet.save();
  }

  request.status = "Rejected";
  request.rejectedAt = new Date();
  request.remarks = remarks || "Rejected by admin";
  await request.save();

  const driver = await DriverProfile.findById(request.driver).populate("user", "name");
  if (driver) {
    await notifyUser({
      user: driver.user._id,
      title: "Withdrawal Rejected",
      message: `Your withdrawal request of ₹${request.amount} has been rejected.`,
      type: "Wallet",
      data: { withdrawalId: request._id, amount: request.amount },
    });
  }

  return request;
};
