import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../src/models/User.js";
import Vehicle from "../src/models/Vehicle.js";
import Booking from "../src/models/Booking.js";
import EmailLog from "../src/models/EmailLog.js";
import {
  notifyAdminOfBookingEmail,
  buildBookingEmailHtml,
} from "../src/services/email.service.js";

let mongoServer;
let vehicle;
let customer;
let booking;

const point = { address: "Test Point", latitude: 13.08, longitude: 80.27 };
const savedEnv = {};

const setMailEnv = () => {
  ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "ADMIN_EMAIL"].forEach(
    (k) => {
      savedEnv[k] = process.env[k];
    }
  );
  process.env.SMTP_HOST = "smtp.test.local";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_USER = "tester";
  process.env.SMTP_PASS = "secret";
  process.env.ADMIN_EMAIL = "admin@genzrides.com";
};

const restoreMailEnv = () => {
  Object.keys(savedEnv).forEach((k) => {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  });
};

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET =
    "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  vehicle = await Vehicle.create({
    name: "SUV",
    seats: 6,
    oneWayBaseFare: 200,
    roundTripBaseFare: 200,
    oneWayBaseKm: 0,
    roundTripBaseKm: 0,
    oneWayPerKm: 18,
    roundTripPerKm: 18,
    minimumDistance: 1,
    isActive: true,
  });

  customer = await User.create({
    name: "Email Customer",
    email: "emailcust@test.com",
    phone: "9876543280",
    password: "Password123",
    role: "customer",
  });

  booking = await Booking.create({
    customer: customer._id,
    pickup: { ...point, address: "Pickup Plaza" },
    drop: { ...point, address: "Drop Towers" },
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
  await EmailLog.deleteMany({});
});

afterEach(() => {
  restoreMailEnv();
});

describe("Admin booking email", () => {
  it("sends a branded email with complete booking details", async () => {
    setMailEnv();
    const sent = [];
    const fakeFactory = async () => ({
      sendMail: async (mail) => {
        sent.push(mail);
        return { messageId: "test-id-1" };
      },
    });

    const populated = await Booking.findById(booking._id)
      .populate("customer", "name phone")
      .populate("vehicleType");
    const result = await notifyAdminOfBookingEmail(
      populated,
      fakeFactory
    );

    expect(result.sent).toBe(true);
    expect(sent.length).toBe(1);
    expect(sent[0].to).toBe("admin@genzrides.com");
    expect(sent[0].subject).toContain("GenZRides");
    expect(sent[0].html).toContain("GenZRides");
    expect(sent[0].html).toContain("Pickup Plaza");
    expect(sent[0].html).toContain("Drop Towers");
    expect(sent[0].html).toContain("SUV");
    expect(sent[0].html).toContain("450");
    expect(sent[0].html).toContain("Email Customer");
    expect(sent[0].text).toContain("Pickup Plaza");
  });

  it("sends to every admin login plus the configured ADMIN_EMAIL", async () => {
    setMailEnv();
    await User.create({
      name: "Admin One",
      email: "admin1@test.com",
      phone: "9876543281",
      password: "Password123",
      role: "admin",
    });
    await User.create({
      name: "Admin Two",
      email: "admin2@test.com",
      phone: "9876543282",
      password: "Password123",
      role: "admin",
    });

    const sent = [];
    const fakeFactory = async () => ({
      sendMail: async (mail) => {
        sent.push(mail);
        return { messageId: "test-id-multi" };
      },
    });

    const populated = await Booking.findById(booking._id)
      .populate("customer", "name phone")
      .populate("vehicleType");
    const result = await notifyAdminOfBookingEmail(
      populated,
      fakeFactory
    );

    expect(result.sent).toBe(true);
    expect(sent.length).toBe(1);
    expect(sent[0].to).toEqual(
      expect.arrayContaining([
        "admin1@test.com",
        "admin2@test.com",
        "admin@genzrides.com",
      ])
    );
  });

  it("includes a View booking deep link when the frontend URL is set", async () => {
    process.env.FRONTEND_URL = "https://app.genzrides.com";
    try {
      const populated = await Booking.findById(booking._id)
        .populate("customer", "name phone")
        .populate("vehicleType");
      const { buildBookingEmailHtml } = await import(
        "../src/services/email.service.js"
      );
      const html = await buildBookingEmailHtml(populated);

      expect(html).toContain("View booking in admin panel");
      expect(html).toContain(
        `https://app.genzrides.com/admin/bookings/${booking._id.toString()}`
      );
    } finally {
      delete process.env.FRONTEND_URL;
    }
  });

  it("omits the View booking button when no frontend URL is set", async () => {
    delete process.env.FRONTEND_URL;
    delete process.env.CLIENT_URL;

    const populated = await Booking.findById(booking._id)
      .populate("customer", "name phone")
      .populate("vehicleType");
    const { buildBookingEmailHtml } = await import(
      "../src/services/email.service.js"
    );
    const html = await buildBookingEmailHtml(populated);

    expect(html).not.toContain("View booking in admin panel");
  });

  it("builds the template without secrets", async () => {
    const populated = await Booking.findById(booking._id)
      .populate("customer", "name phone")
      .populate("vehicleType");
    const html = await buildBookingEmailHtml(populated);

    expect(html).not.toContain("SMTP_PASS");
    expect(html).not.toContain("secret");
    expect(html).toContain("support@genzrides.com");
  });

  it("dedupes repeat sends per booking", async () => {
    setMailEnv();
    let calls = 0;
    const fakeFactory = async () => ({
      sendMail: async () => {
        calls += 1;
        return { messageId: "test-id-2" };
      },
    });

    const populated = await Booking.findById(booking._id)
      .populate("customer", "name phone")
      .populate("vehicleType");

    const first = await notifyAdminOfBookingEmail(populated, fakeFactory);
    const second = await notifyAdminOfBookingEmail(populated, fakeFactory);

    expect(first.sent).toBe(true);
    expect(second.sent).toBe(false);
    expect(second.skipped).toBe("duplicate");
    expect(calls).toBe(1);
  });

  it("skips gracefully when mail is not configured and never throws", async () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.ADMIN_EMAIL;

    const populated = await Booking.findById(booking._id)
      .populate("customer", "name phone")
      .populate("vehicleType");

    await expect(
      notifyAdminOfBookingEmail(populated, async () => {
        throw new Error("must not be called");
      })
    ).resolves.toEqual({
      sent: false,
      skipped: "email-not-configured",
    });
  });

  it("records failure without throwing when the transport fails", async () => {
    setMailEnv();
    const failingFactory = async () => ({
      sendMail: async () => {
        throw new Error("SMTP down");
      },
    });

    const populated = await Booking.findById(booking._id)
      .populate("customer", "name phone")
      .populate("vehicleType");

    const result = await notifyAdminOfBookingEmail(
      populated,
      failingFactory
    );

    expect(result).toEqual({ sent: false, skipped: "send-failed" });
  });
});
