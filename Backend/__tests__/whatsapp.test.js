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
  buildViewBookingButton,
  buildBookingActionButtons,
  BOOKING_ALERT_ACTIONS_TEMPLATE,
} from "../src/services/whatsapp.service.js";

let mongoServer;
let booking;
let vehicleId;
let customerId;

const ADMIN_TEST_NUMBER = "919876543210";

const setWaEnv = () => {
  process.env.WHATSAPP_TOKEN = "test-token";
  process.env.WHATSAPP_PHONE_NUMBER_ID = "123456789012345";
  process.env.WHATSAPP_BUSINESS_NUMBER = ADMIN_TEST_NUMBER;
  process.env.WHATSAPP_TEMPLATE_NAME = "booking_alert_actions";
  process.env.WHATSAPP_TEMPLATE_LANG = "en";
  process.env.FRONTEND_URL = "https://admin.test";
};

const restoreFrontendUrl = () => {
  delete process.env.FRONTEND_URL;
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
  vehicleId = vehicle._id;
  customerId = customer._id;
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
  restoreFrontendUrl();
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
    expect(captured[0].template.name).toBe("booking_alert_actions");
    // Invoice param order: ref, name, phone, pickup, drop, when, vehicle, fare
    const params = captured[0].template.components[0].parameters.map((p) => p.text);
    expect(params).toHaveLength(8);
    expect(params[0]).toMatch(/^[0-9A-F]{8}$/);
    expect(params[1]).toBe("WA Customer");
    expect(params[2]).toBe("9876543298");
    expect(params[7]).toBe("450");
    // Three action URL buttons (View idx 0, Verify idx 1, Cancel idx 2),
    // each carrying the full booking id as its {{1}} suffix.
    const buttons = captured[0].template.components.filter((c) => c.type === "button");
    expect(buttons).toHaveLength(3);
    expect(buttons.map((b) => b.index)).toEqual(["0", "1", "2"]);
    buttons.forEach((b) => {
      expect(b.sub_type).toBe("url");
      expect(b.parameters[0].text).toBe(String(populated._id));
    });

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
    expect(BOOKING_ALERT_ACTIONS_TEMPLATE.name).toBe("booking_alert_actions");
    expect(buildViewBookingButton("abc123")).toEqual({
      type: "button",
      sub_type: "url",
      index: "2",
      parameters: [{ type: "text", text: "abc123" }],
    });
    expect(buildBookingActionButtons("abc123")).toEqual([
      { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: "abc123" }] },
      { type: "button", sub_type: "url", index: "1", parameters: [{ type: "text", text: "abc123" }] },
      { type: "button", sub_type: "url", index: "2", parameters: [{ type: "text", text: "abc123" }] },
    ]);
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

    expect(calls).toBe(4);
    expect(result).toMatchObject({ sent: true, via: "text" });
    expect(texts).toHaveLength(1);
    expect(texts[0]).toContain("🧾 *New Booking");
    expect(texts[0]).toContain("Est. Fare:* ₹450 (Cash)");
    expect(texts[0]).toContain("Pickup:* Pickup Plaza");
    expect(texts[0]).toMatch(/VERIFY [0-9A-F]{8}.*CANCEL [0-9A-F]{8}/);
  });

  it("falls back through button layouts until the template accepts", async () => {
    const seen = [];
    const pickySender = async (payload) => {
      seen.push(payload);
      const buttons = (payload.template.components || []).filter((c) => c.type === "button");
      // Reject the 3-URL layout (e.g. dashboard still has quick replies),
      // accept anything with one or zero button components.
      if (buttons.length > 1) {
        const err = new Error("Parameter mismatch");
        err.response = { status: 400, data: { error: { code: 132000, message: "Parameter mismatch" } } };
        throw err;
      }
      return { sent: true, messageId: "test-cascade-1" };
    };
    // Fresh booking: the shared fixture may already carry a sent log.
    const fresh = await Booking.create({
      customer: customerId,
      pickup: { address: "Pickup Plaza", latitude: 13.08, longitude: 80.27 },
      drop: { address: "Drop Towers", latitude: 13.08, longitude: 80.27 },
      pickupDateTime: new Date(Date.now() + 86400000),
      tripType: "One Way",
      vehicleType: vehicleId,
      estimatedFare: 450,
      paymentMethod: "Cash",
      bookingStatus: "Pending",
    });
    const populatedFresh = await Booking.findById(fresh._id)
      .populate("customer", "name phone")
      .populate("vehicleType");

    const result = await notifyAdminOfBooking(populatedFresh, pickySender);

    expect(result).toMatchObject({ sent: true, via: "template" });
    // 3-url rejected, single-view-url accepted → 2 template attempts, no text.
    expect(seen).toHaveLength(2);
    expect(seen.every((p) => p.type === "template")).toBe(true);
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
