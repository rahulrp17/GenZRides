import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../src/models/User.js";
import Vehicle from "../src/models/Vehicle.js";
import Booking from "../src/models/Booking.js";
import {
  buildConfirmationEmailHtml,
  buildConfirmationEmailText,
  buildConfirmationEmailView,
  notifyCustomerOfConfirmation,
} from "../src/services/email.service.js";

let mongoServer;
let vehicle;
let customer;
let guestCustomer;

const savedEnv = {};
const setMailEnv = () => {
  ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM"].forEach(
    (k) => {
      savedEnv[k] = process.env[k];
    }
  );
  process.env.SMTP_HOST = "smtp.test.local";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_USER = "tester";
  process.env.SMTP_PASS = "secret";
  process.env.EMAIL_FROM = "GenZRides <test@genzrides.com>";
};

const restoreMailEnv = () => {
  Object.keys(savedEnv).forEach((k) => {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  });
};

const sentMails = [];
const fakeTransportFactory = async () => ({
  sendMail: async (opts) => {
    sentMails.push(opts);
    return { messageId: "test-confirm-1" };
  },
});

const point = { address: "Test Point", latitude: 13.08, longitude: 80.27 };

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET =
    "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  setMailEnv();
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  vehicle = await Vehicle.create({
    name: "Sedan",
    seats: 4,
    oneWayBaseFare: 100,
    roundTripBaseFare: 100,
    oneWayBaseKm: 0,
    roundTripBaseKm: 0,
    oneWayPerKm: 12,
    roundTripPerKm: 12,
    minimumDistance: 1,
    isActive: true,
  });

  customer = await User.create({
    name: "Confirm Customer",
    email: "confirm.cust2@example.com",
    phone: "9841000011",
    password: "Password123",
    role: "customer",
  });

  // Phone-keyed guest account: placeholder email by design.
  guestCustomer = await User.create({
    name: "Guest Rider",
    email: "guest-9841000012@guest.letsgocab.local",
    phone: "9841000012",
    password: "Password123",
    role: "customer",
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
  restoreMailEnv();
});

beforeEach(() => {
  sentMails.length = 0;
});

const makeBooking = (overrides = {}) =>
  Booking.create({
    customer: customer._id,
    pickup: { ...point, address: "Pickup Plaza" },
    drop: { ...point, address: "Drop Towers" },
    pickupDateTime: new Date(Date.now() + 86400000),
    tripType: "One Way",
    vehicleType: vehicle._id,
    estimatedFare: 450,
    paymentMethod: "Cash",
    bookingStatus: "Pending",
    approvalStatus: "Approved",
    ...overrides,
  });

describe("customer booking-confirmed email", () => {
  it("sends to the real guest snapshot, never the placeholder", async () => {
    const booking = await makeBooking({
      customer: guestCustomer._id,
      guestName: "Guest Rider",
      guestEmail: "real.guest@example.com",
      guestPhone: "9841000012",
    });

    const result = await notifyCustomerOfConfirmation(
      booking._id,
      fakeTransportFactory
    );

    expect(result.sent).toBe(true);
    expect(sentMails).toHaveLength(1);
    expect(sentMails[0].to).toBe("real.guest@example.com");
    expect(sentMails[0].subject).toContain("Booking confirmed");
    expect(sentMails[0].html).toContain("BOOKING CONFIRMED");
    expect(sentMails[0].text).toContain("assigning your driver");
  });

  it("sends to a registered customer address", async () => {
    const booking = await makeBooking();

    const result = await notifyCustomerOfConfirmation(
      booking._id,
      fakeTransportFactory
    );

    expect(result.sent).toBe(true);
    expect(sentMails[0].to).toBe("confirm.cust2@example.com");
  });

  it("skips when only a placeholder address exists", async () => {
    const booking = await makeBooking({ customer: guestCustomer._id });

    const result = await notifyCustomerOfConfirmation(
      booking._id,
      fakeTransportFactory
    );

    expect(result).toMatchObject({ sent: false, skipped: "no-recipient" });
    expect(sentMails).toHaveLength(0);
  });

  it("builds a confirmation view without any driver", async () => {
    const booking = await makeBooking({
      customer: guestCustomer._id,
      guestName: "Guest Rider",
      guestEmail: "real.guest@example.com",
      guestPhone: "9841000012",
    });
    const populated = await Booking.findById(booking._id)
      .populate("customer", "name phone email")
      .populate("vehicleType", "name")
      .lean();
    const view = buildConfirmationEmailView(populated);
    expect(view.customerName).toBe("Guest Rider");
    expect(view.driverName).toBeUndefined();
    expect(buildConfirmationEmailHtml(view)).toContain(view.ref);
    expect(buildConfirmationEmailText(view)).toContain("Booking Confirmed");
  });
});
