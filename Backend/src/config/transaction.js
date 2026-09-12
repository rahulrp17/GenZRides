import mongoose from "mongoose";

/**
 * Whether the connected MongoDB deployment supports multi-document
 * transactions (a replica set / sharded cluster / mongos). Standalone
 * single-node MongoDB does NOT support transactions.
 *
 * PRODUCTION REQUIREMENT:
 * Use MongoDB Atlas (M0+ or dedicated) or a self-managed replica set, NOT a
 * standalone `mongod`. Transactions are required for true multi-document ACID
 * guarantees (e.g. completing a ride while crediting the driver wallet).
 */
export const supportsTransactions = () => {
  try {
    const topology = mongoose.connection?.client?.topology;
    if (!topology) return false;
    const name = topology.constructor?.name || "";
    return (
      name.includes("ReplSet") ||
      name.includes("Shard") ||
      name.includes("Mongos")
    );
  } catch {
    return false;
  }
};

/**
 * Run `fn(session)` inside a transaction when the deployment supports it.
 * When transactions are unavailable (standalone MongoDB), the function runs
 * without a session — atomic single-document updates (findOneAndUpdate) still
 * protect the critical sections, so behaviour degrades gracefully.
 */
export async function withTransaction(fn) {
  if (!supportsTransactions()) {
    // NOT a replica set / sharded cluster (e.g. standalone `mongod`).
    // We do NOT claim ACID: operations run without a session and rely on
    // single-document atomicity (findOneAndUpdate, etc.). Multi-document
    // consistency is NOT guaranteed here.
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[transaction] Multi-document transactions unavailable: connected MongoDB is not a replica set / Atlas. ACID guarantees are NOT active. Use MongoDB Atlas or a replica set in production."
      );
    }
    return await fn(null);
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}
