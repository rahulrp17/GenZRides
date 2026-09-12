import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const fixBookingAlertIndexes = async () => {
  // Migrate old `unique:true` on `booking` (all statuses) → partial unique
  // on `{booking, status:"sent"}` so `failed` never blocks a retry. This
  // runs on every boot (best-effort, no throw) so a prod upgrade without a
  // manual `db.emaillogs.dropIndex` still self-heals. The new index is also
  // declared in the Mongoose schema; this is just the migration for
  // already-created collections.
  try {
    const db = mongoose.connection.db;
    if (!db) return;
    for (const collName of ["emaillogs", "whatsapplogs"]) {
      try {
        const coll = db.collection(collName);
        const indexes = await coll.indexes();
        const oldIdx = indexes.find((ix) => ix.key?.booking === 1 && ix.unique && !ix.partialFilterExpression);
        if (oldIdx) {
          console.log(`[db] migrating ${collName} index ${oldIdx.name} → partial unique on sent`);
          try {
            await coll.dropIndex(oldIdx.name);
          } catch (e) {
            console.warn(`[db] drop ${collName}.${oldIdx.name} failed: ${e.message}`);
          }
        }
        // Ensure the partial index exists (idempotent)
        await coll.createIndex(
          { booking: 1 },
          { unique: true, partialFilterExpression: { status: "sent" }, background: true }
        );
      } catch (e) {
        // Collection may not exist on fresh DBs — ignore.
        if (!String(e.message).includes("ns not found")) {
          console.warn(`[db] index migration for ${collName} warning: ${e.message}`);
        }
      }
    }
  } catch (e) {
    console.warn(`[db] booking alert index migration skipped: ${e.message}`);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // Best-effort index migration — never blocks startup.
    try {
      await fixBookingAlertIndexes();
    } catch {}
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB runtime error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Attempting to reconnect...");
  });
};

export default connectDB;
