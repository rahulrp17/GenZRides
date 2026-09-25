import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../src/models/User.js";
import Vehicle from "../src/models/Vehicle.js";
import Booking from "../src/models/Booking.js";
import WhatsappLog from "../src/models/WhatsappLog.js";
import {
  notifyAdminOfBooking,
  normalizeRecipient,
  buildBookingTemplateParams,
  PREMIUM_BOOKING_TEMPLATE,
} from "../src/services/whatsapp.service.js";

let mongoServer;
let booking;

const ADMIN_TEST_NUMBER = "919876543210";

const setWaEnv = () => {
  process.env.WHATSAPP_TOKEN = "test-token";
  process.env.WHATSAPP_PHONE_NUMBER_ID = "123456789012345";
  process.env.WHATSAPP_BUSINESS_NUMBER = ADMIN_TEST_NUMBER;
  process.env.WHATSAPP_TEMPLATE_NAME = "premium_booking_invoice";
  process.env.WHATSAPP_TEMPLATE_LANG = "en";
};

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET =
    "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  setWaEnv();

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const vehicle = await Vehicle.create({
    name: "Sedan",
    seats: 4,
    oneWayBaseFare: 100,
    roundTripBaseFare: 100,
    oneWayBaseKm: 0,
    roundTripBaseKm: 0,
    oneWayPerKm: 14,
    roundTripPerKm: 14,
    minimumDistance: 1,
    isActive: true,
  });
  const customer = await User.create({
    name: "WA Customer",
    email: "wacust@test.com",
    phone: "9876543298",
    password: "Password123",
    role: "customer",
  });
  booking = await Booking.create({
    customer: customer._id,
    pickup: { address: "Pickup Plaza", latitude: 13.08, longitude: 80.27 },
    drop: { address: "Drop Towers", latitude: 13.08, longitude: 80.27 },
    pickupDateTime: new Date(Date.now() + 86400000),
    tripType: "One Way",
    vehicleType: vehicle._id,
    estimatedFare: 450,
    paymentMethod: "Cash",
    bookingStatus: "Pending",
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await WhatsappLog.deleteMany({});
});

describe("Admin booking WhatsApp alert", () => {
  it("normalizes a 10-digit Indian mobile to full international format", () => {
    expect(normalizeRecipient("9876543210")).toBe("919876543210");
    expect(normalizeRecipient(ADMIN_TEST_NUMBER)).toBe(ADMIN_TEST_NUMBER);
  });

  it("sends the template alert to the admin business number, once per booking", async () => {
    const captured = [];
    const fakeSender = async (payload) => {
      captured.push(payload);
      return { sent: true, messageId: "test-msg-1" };
    };
    const populated = await Booking.findById(booking._id)
      .populate("customer", "name phone")
      .populate("vehicleType");

    const result = await notifyAdminOfBooking(populated, fakeSender);

    expect(result.sent).toBe(true);
    expect(result.via).toBe("template");
    expect(captured).toHaveLength(1);
    expect(captured[0].to).toBe(ADMIN_TEST_NUMBER);
    expect(captured[0].template.name).toBe("premium_booking_invoice");
    // Invoice param order: ref, name, phone, pickup, drop, when, vehicle, fare
    const params = captured[0].template.components[0].parameters.map((p) => p.text);
    expect(params).toHaveLength(8);
    expect(params[0]).toMatch(/^[0-9A-F]{8}$/);
    expect(params[1]).toBe("WA Customer");
    expect(params[2]).toBe("9876543298");
    expect(params[7]).toBe("450");

    const log = await WhatsappLog.findOne({ booking: booking._id }).lean();
    expect(log?.status).toBe("sent");
    expect(log?.to).toBe(ADMIN_TEST_NUMBER);

    const dup = await notifyAdminOfBooking(populated, fakeSender);
    expect(dup).toMatchObject({ sent: false, skipped: "duplicate" });
    expect(captured).toHaveLength(1);
  });

  it("keeps template params in invoice order (ref..fare)", async () => {
    const populated = await Booking.findById(booking._id)
      .populate("customer", "name phone")
      .populate("vehicleType");
    const params = await buildBookingTemplateParams(populated);
    expect(params).toHaveLength(8);
    expect(params[0]).toMatch(/^[0-9A-F]{8}$/);
    expect(params.slice(1)).toEqual([
      "WA Customer",
      "9876543298",
      "Pickup Plaza",
      "Drop Towers",
      expect.stringContaining("One Way"),
      "Sedan",
      "450",
    ]);
    expect(PREMIUM_BOOKING_TEMPLATE.name).toBe("premium_booking_invoice");
  });

  it("falls back to the invoice-style text alert when the template send fails", async () => {
    const texts = [];
    let calls = 0;
    const flakySender = async (payload) => {
      calls += 1;
      if (payload.type === "template") throw new Error("template missing");
      texts.push(payload.text.body);
      return { sent: true, messageId: "test-msg-text" };
    };
    const populated = await Booking.findById(booking._id)
      .populate("customer", "name phone")
      .populate("vehicleType");

    const result = await notifyAdminOfBooking(populated, flakySender);

    expect(calls).toBe(2);
    expect(result).toMatchObject({ sent: true, via: "text" });
    expect(texts).toHaveLength(1);
    expect(texts[0]).toContain("🧾 *New Booking Received* ✅");
    expect(texts[0]).toContain("💰 *Est. Fare:* ₹450 (Cash)");
    expect(texts[0]).toContain("📍 *Pickup:* Pickup Plaza");
  });

  it("records the structured Meta error when the send fails", async () => {
    const metaErr = new Error("API access blocked.");
    metaErr.response = {
      status: 400,
      data: {
        error: {
          code: 200,
          error_subcode: 123456,
          type: "OAuthException",
          message: "API access blocked.",
        },
      },
    };
    const failingSender = async () => {
      throw metaErr;
    };
    const populated = await Booking.findById(booking._id)
      .populate("customer", "name phone")
      .populate("vehicleType");

    const result = await notifyAdminOfBooking(populated, failingSender);

    expect(result.sent).toBe(false);
    expect(result.skipped).toBe("send-failed");
    const log = await WhatsappLog.findOne({ booking: booking._id }).lean();
    expect(log?.status).toBe("failed");
    expect(log?.error).toContain("code=200");
    expect(log?.error).toContain("API access blocked.");
  });

  it("skips cleanly when WhatsApp is not configured", async () => {
    const saved = process.env.WHATSAPP_TOKEN;
    delete process.env.WHATSAPP_TOKEN;
    try {
      const populated = await Booking.findById(booking._id)
        .populate("customer", "name phone")
        .populate("vehicleType");
      const result = await notifyAdminOfBooking(populated, async () => ({
        sent: true,
      }));
      expect(result).toMatchObject({
        sent: false,
        skipped: "whatsapp-not-configured",
      });
    } finally {
      process.env.WHATSAPP_TOKEN = saved;
    }
  });
});
