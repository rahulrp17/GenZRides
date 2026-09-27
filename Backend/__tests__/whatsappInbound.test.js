import mongoose from "mongoose";
import crypto from "crypto";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Vehicle from "../src/models/Vehicle.js";
import Booking from "../src/models/Booking.js";
import WhatsappInbound from "../src/models/WhatsappInbound.js";
import {
  parseIncomingMessages,
  parseAdminCommand,
  verifyMetaSignature,
  isAdminSender,
  handleAdminMessage,
} from "../src/services/whatsappInbound.service.js";

let mongoServer;
let vehicle;
let guestCustomer;
let customer;

const ADMIN_TEST_NUMBER = "919876543210";
const OTHER_NUMBER = "919999999999";

const setWaEnv = () => {
  process.env.WHATSAPP_TOKEN = "test-token";
  process.env.WHATSAPP_PHONE_NUMBER_ID = "123456789012345";
  process.env.WHATSAPP_BUSINESS_NUMBER = ADMIN_TEST_NUMBER;
  process.env.WHATSAPP_TEMPLATE_NAME = "booking_alert_actions";
  process.env.WHATSAPP_TEMPLATE_LANG = "en";
};

const loc = (address) => ({ address, latitude: 13.0, longitude: 80.2 });

const sentTexts = [];
const fakeSender = async (payload) => {
  sentTexts.push(payload);
  return { sent: true, messageId: "test-inbound-1" };
};
const lastText = () =>
  sentTexts.length ? sentTexts[sentTexts.length - 1].text.body : "";

const pendingBookingDoc = (overrides = {}) => ({
  customer: customer._id,
  pickup: loc("Pickup Plaza"),
  drop: loc("Drop Towers"),
  pickupDateTime: new Date(Date.now() + 86400000),
  tripType: "One Way",
  vehicleType: vehicle._id,
  estimatedFare: 450,
  paymentMethod: "Cash",
  bookingStatus: "Pending",
  approvalStatus: "Pending Approval",
  ...overrides,
});

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET =
    "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  setWaEnv();
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  vehicle = await Vehicle.create({
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
  customer = await User.create({
    name: "Inbound Customer",
    email: "inboundcust@test.com",
    phone: "9876543301",
    password: "Password123",
    role: "customer",
  });
  guestCustomer = await User.create({
    name: "Inbound Guest",
    email: "guest-9876543302@guest.letsgocab.local",
    phone: "9876543302",
    password: "Password123",
    role: "customer",
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
  await WhatsappInbound.deleteMany({});
  sentTexts.length = 0;
});

describe("webhook payload parsing", () => {
  it("reads button taps, interactive replies and plain text; skips statuses", () => {
    const payload = {
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  { id: "m1", from: ADMIN_TEST_NUMBER, type: "button", button: { text: "✅ Verify" } },
                  { id: "m2", from: ADMIN_TEST_NUMBER, type: "interactive", interactive: { button_reply: { id: "cancel_x", title: "❌ Cancel" } } },
                  { id: "m3", from: ADMIN_TEST_NUMBER, type: "text", text: { body: "VERIFY A1B2C3D4" } },
                ],
                statuses: [{ id: "s1", status: "delivered" }],
              },
            },
          ],
        },
      ],
    };
    const msgs = parseIncomingMessages(payload);
    expect(msgs).toHaveLength(3);
    expect(msgs[0]).toMatchObject({ messageId: "m1", text: "✅ Verify" });
    expect(msgs[1].text).toBe("cancel_x");
    expect(msgs[2].text).toBe("VERIFY A1B2C3D4");
  });
});

describe("admin command parsing", () => {
  it("parses VERIFY / CANCEL (+reason) / STATUS with refs", () => {
    expect(parseAdminCommand("VERIFY A1B2C3D4")).toEqual({ action: "verify", ref: "A1B2C3D4" });
    expect(parseAdminCommand("verify #a1b2c3d4")).toEqual({ action: "verify", ref: "A1B2C3D4" });
    expect(parseAdminCommand("CANCEL A1B2C3D4 duplicate booking")).toEqual({
      action: "cancel",
      ref: "A1B2C3D4",
      reason: "duplicate booking",
    });
    expect(parseAdminCommand("status A1B2C3D4")).toEqual({ action: "status", ref: "A1B2C3D4" });
  });

  it("treats bare taps as ref-less actions and random text as unknown", () => {
    expect(parseAdminCommand("✅ Verify")).toEqual({ action: "verify", ref: null });
    expect(parseAdminCommand("❌ Cancel")).toEqual({ action: "cancel", ref: null, reason: null });
    expect(parseAdminCommand("hello")).toEqual({ action: "help", ref: null });
    expect(parseAdminCommand("what time is it")).toEqual({ action: null, ref: null });
  });
});

describe("sender guard + signature", () => {
  it("only the configured admin number passes", () => {
    expect(isAdminSender(ADMIN_TEST_NUMBER)).toBe(true);
    expect(isAdminSender("9812345678")).toBe(false);
    expect(isAdminSender(OTHER_NUMBER)).toBe(false);
    expect(isAdminSender("")).toBe(false);
  });

  it("accepts without a secret, enforces a valid HMAC with one", () => {
    expect(verifyMetaSignature("body", "whatever", "")).toBe(true);
    const secret = "test-app-secret";
    const raw = '{"hello":"world"}';
    const good =
      "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
    expect(verifyMetaSignature(raw, good, secret)).toBe(true);
    expect(verifyMetaSignature(raw, "sha256=deadbeef", secret)).toBe(false);
    expect(verifyMetaSignature(raw, null, secret)).toBe(false);
  });
});

describe("verify via WhatsApp", () => {
  it("approves a guest booking and confirms without dashboard", async () => {
    const booking = await Booking.create(
      pendingBookingDoc({
        customer: guestCustomer._id,
        guestName: "Inbound Guest",
        guestEmail: "inbound.guest@example.com",
        guestPhone: "9876543302",
      })
    );
    const ref = booking._id.toString().slice(-8).toUpperCase();

    const result = await handleAdminMessage(
      { from: ADMIN_TEST_NUMBER, text: `VERIFY ${ref}`, messageId: "wamid-verify-1" },
      { sender: fakeSender }
    );

    expect(result.handled).toBe(true);
    expect(result.action).toBe("verify");
    const stored = await Booking.findById(booking._id).lean();
    expect(stored.approvalStatus).toBe("Approved");
    expect(lastText()).toContain(`#${ref}`);
    expect(lastText()).toMatch(/verified/i);

    const ledger = await WhatsappInbound.findOne({ messageId: "wamid-verify-1" }).lean();
    expect(ledger?.action).toBe("verify");
  });

  it("approves a registered booking through approveBooking", async () => {
    const booking = await Booking.create(pendingBookingDoc());
    const ref = booking._id.toString().slice(-8).toUpperCase();

    const result = await handleAdminMessage(
      { from: ADMIN_TEST_NUMBER, text: `verify ${ref.toLowerCase()}`, messageId: "wamid-verify-2" },
      { sender: fakeSender }
    );

    expect(result.handled).toBe(true);
    const stored = await Booking.findById(booking._id).lean();
    expect(stored.approvalStatus).toBe("Approved");
    expect(lastText()).toContain(`#${ref}`);
  });

  it("resolves a bare tap to the single pending booking", async () => {
    const booking = await Booking.create(
      pendingBookingDoc({ customer: guestCustomer._id })
    );
    const ref = booking._id.toString().slice(-8).toUpperCase();

    const result = await handleAdminMessage(
      { from: ADMIN_TEST_NUMBER, text: "✅ Verify", messageId: "wamid-verify-3" },
      { sender: fakeSender }
    );

    expect(result.handled).toBe(true);
    expect(lastText()).toContain(`#${ref}`);
    const stored = await Booking.findById(booking._id).lean();
    expect(stored.approvalStatus).toBe("Approved");
  });

  it("asks for a ref when several bookings await action", async () => {
    await Booking.create(pendingBookingDoc());
    await Booking.create(pendingBookingDoc());

    const result = await handleAdminMessage(
      { from: ADMIN_TEST_NUMBER, text: "✅ Verify", messageId: "wamid-verify-4" },
      { sender: fakeSender }
    );

    expect(result).toMatchObject({ handled: true, action: "needs-ref" });
    expect(lastText()).toMatch(/2.*awaiting|awaiting.*2/i);

    const pending = await Booking.countDocuments({ approvalStatus: "Pending Approval" });
    expect(pending).toBe(2);
  });
});

describe("cancel via WhatsApp", () => {
  it("cancels with a reason and confirms", async () => {
    const booking = await Booking.create(pendingBookingDoc());
    const ref = booking._id.toString().slice(-8).toUpperCase();

    const result = await handleAdminMessage(
      { from: ADMIN_TEST_NUMBER, text: `CANCEL ${ref} fake request`, messageId: "wamid-cancel-1" },
      { sender: fakeSender }
    );

    expect(result.handled).toBe(true);
    const stored = await Booking.findById(booking._id).lean();
    expect(stored.bookingStatus).toBe("Cancelled");
    expect(stored.cancelReason).toBe("fake request");
    expect(lastText()).toMatch(/cancelled/i);
    expect(lastText()).toContain(`#${ref}`);
  });
});

describe("safety rails", () => {  it("ignores non-admin senders silently", async () => {
    const booking = await Booking.create(pendingBookingDoc());
    const ref = booking._id.toString().slice(-8).toUpperCase();

    const result = await handleAdminMessage(
      { from: OTHER_NUMBER, text: `VERIFY ${ref}`, messageId: "wamid-evil-1" },
      { sender: fakeSender }
    );

    expect(result).toMatchObject({ handled: false, skipped: "not-admin" });
    expect(sentTexts).toHaveLength(0);
    const stored = await Booking.findById(booking._id).lean();
    expect(stored.approvalStatus).toBe("Pending Approval");
  });

  it("never processes the same Meta retry twice", async () => {
    const booking = await Booking.create(pendingBookingDoc());
    const ref = booking._id.toString().slice(-8).toUpperCase();

    const first = await handleAdminMessage(
      { from: ADMIN_TEST_NUMBER, text: `CANCEL ${ref}`, messageId: "wamid-dedupe-1" },
      { sender: fakeSender }
    );
    const second = await handleAdminMessage(
      { from: ADMIN_TEST_NUMBER, text: `CANCEL ${ref}`, messageId: "wamid-dedupe-1" },
      { sender: fakeSender }
    );

    expect(first.handled).toBe(true);
    expect(second).toMatchObject({ handled: false, skipped: "duplicate" });
    expect(sentTexts.filter((p) => p.text.body.includes("cancelled")).length).toBe(1);
  });

  it("answers STATUS with a live summary", async () => {
    const booking = await Booking.create(pendingBookingDoc());
    const ref = booking._id.toString().slice(-8).toUpperCase();

    const result = await handleAdminMessage(
      { from: ADMIN_TEST_NUMBER, text: `STATUS ${ref}`, messageId: "wamid-status-1" },
      { sender: fakeSender }
    );

    expect(result.handled).toBe(true);
    expect(lastText()).toContain(`#${ref}`);
    expect(lastText()).toMatch(/Pending/);
  });
});

describe("webhook endpoints", () => {
  const OLD_VERIFY = process.env.WHATSAPP_VERIFY_TOKEN;
  const OLD_SECRET = process.env.WHATSAPP_APP_SECRET;

  afterEach(() => {
    if (OLD_VERIFY === undefined) delete process.env.WHATSAPP_VERIFY_TOKEN;
    else process.env.WHATSAPP_VERIFY_TOKEN = OLD_VERIFY;
    if (OLD_SECRET === undefined) delete process.env.WHATSAPP_APP_SECRET;
    else process.env.WHATSAPP_APP_SECRET = OLD_SECRET;
  });

  it("verifies the Meta handshake only with the right token", async () => {
    process.env.WHATSAPP_VERIFY_TOKEN = "test-verify-123";
    delete process.env.WHATSAPP_APP_SECRET;
    const ok = await request(app).get(
      "/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=test-verify-123&hub.challenge=CHALLENGE"
    );
    expect(ok.status).toBe(200);
    expect(ok.text).toBe("CHALLENGE");

    const bad = await request(app).get(
      "/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=nope&hub.challenge=CHALLENGE"
    );
    expect(bad.status).toBe(403);
  });

  it("ignores non-admin senders without any downstream send", async () => {
    delete process.env.WHATSAPP_APP_SECRET;
    const payload = {
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    id: "wamid-ctrl-1",
                    from: OTHER_NUMBER,
                    type: "text",
                    text: { body: "VERIFY A1B2C3D4" },
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const res = await request(app).post("/api/webhooks/whatsapp").send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, handled: 1 });
    expect(await WhatsappInbound.countDocuments({})).toBe(0);
  });

  it("enforces the Meta signature once an app secret is set", async () => {
    process.env.WHATSAPP_APP_SECRET = "ctrl-secret";
    const raw = JSON.stringify({ entry: [] });
    const good =
      "sha256=" +
      crypto.createHmac("sha256", "ctrl-secret").update(raw).digest("hex");
    const ok = await request(app)
      .post("/api/webhooks/whatsapp")
      .set("Content-Type", "application/json")
      .set("X-Hub-Signature-256", good)
      .send(raw);
    expect(ok.status).toBe(200);

    const bad = await request(app)
      .post("/api/webhooks/whatsapp")
      .set("Content-Type", "application/json")
      .set("X-Hub-Signature-256", "sha256=deadbeef")
      .send(raw);
    expect(bad.status).toBe(401);
  });
});
