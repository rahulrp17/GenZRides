import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Vehicle from "../src/models/Vehicle.js";
import DriverProfile from "../src/models/DriverProfile.js";
import Booking from "../src/models/Booking.js";
import {
  buildAssignmentEmailHtml,
  buildAssignmentEmailText,
  buildAssignmentEmailView,
  notifyCustomerOfAssignment,
} from "../src/services/email.service.js";
import bcrypt from "bcryptjs";

let mongoServer;
let testVehicle;
let customerId;
let driverProfileId;

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
    return { messageId: "test-msg-1" };
  },
});

const assignedBookingDoc = (overrides = {}) => ({
  customer: customerId,
  driver: driverProfileId,
  pickup: { address: "Trichy, Tamil Nadu", latitude: 10.79, longitude: 78.7 },
  drop: { address: "Chennai, Tamil Nadu", latitude: 13.08, longitude: 80.27 },
  pickupDateTime: new Date(Date.now() + 86400000),
  tripType: "One Way",
  days: 1,
  vehicleType: testVehicle._id,
  distance: 330,
  estimatedFare: 4500,
  paymentMethod: "Cash",
  bookingStatus: "Accepted",
  approvalStatus: "Approved",
  ...overrides,
});

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  setMailEnv();
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hashedPassword = await bcrypt.hash("Password123", 10);

  const customer = await User.create({
    name: "Confirm Customer",
    email: "confirm.cust@example.com",
    phone: "9841000001",
    password: hashedPassword,
    role: "customer",
  });
  customerId = customer._id;

  const driverUser = await User.create({
    name: "Confirm Driver",
    email: "confirm.driver@example.com",
    phone: "9841000002",
    password: hashedPassword,
    role: "driver",
  });

  testVehicle = await Vehicle.create({
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

  const profile = await DriverProfile.create({
    user: driverUser._id,
    aadhaarNumber: "984100000011",
    licenseNumber: "CNDL00000001",
    vehicleType: testVehicle._id,
    vehicleBrand: "Maruti",
    vehicleModel: "Dzire",
    vehicleColor: "White",
    vehicleYear: 2022,
    vehicleNumber: "TN98CN0001",
    approvalStatus: "Approved",
    isOnline: true,
    isAvailable: true,
    currentLocation: { type: "Point", coordinates: [80.27, 13.08] },
  });
  driverProfileId = profile._id;
});

afterAll(async () => {
  restoreMailEnv();
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
  sentMails.length = 0;
});

describe("Customer booking-confirmed email on driver assignment", () => {
  it("emails the account address with full premium details", async () => {
    const booking = await Booking.create(assignedBookingDoc());

    const res = await notifyCustomerOfAssignment(booking._id, fakeTransportFactory);

    expect(res.sent).toBe(true);
    expect(sentMails).toHaveLength(1);
    const mail = sentMails[0];
    expect(mail.to).toBe("confirm.cust@example.com");
    expect(mail.subject).toMatch(/Driver assigned/);
    expect(mail.subject).toMatch(booking._id.toString().slice(-8).toUpperCase());
    // Premium responsive body: route, driver, vehicle, fare, call link.
    expect(mail.html).toMatch(/Confirm Driver/);
    expect(mail.html).toMatch(/TN98CN0001/);
    expect(mail.html).toMatch(/Trichy, Tamil Nadu/);
    expect(mail.html).toMatch(/Chennai, Tamil Nadu/);
    expect(mail.html).toMatch(/tel:/);
    expect(mail.html).toMatch(/viewport/);
    expect(mail.html).toMatch(/4,500/);
    expect(mail.text).toMatch(/Confirm Driver/);
    expect(mail.text).toMatch(/Trichy, Tamil Nadu/);
  });

  it("prefers the real guest snapshot address for guest bookings", async () => {
    const booking = await Booking.create(
      assignedBookingDoc({
        guestName: "Guest User",
        guestEmail: "guest.user@example.com",
        guestPhone: "9841000003",
      })
    );

    const res = await notifyCustomerOfAssignment(booking._id, fakeTransportFactory);

    expect(res.sent).toBe(true);
    expect(sentMails[0].to).toBe("guest.user@example.com");
    expect(sentMails[0].html).toMatch(/Guest User/);
  });

  it("never mails placeholder guest-domain addresses", async () => {
    const ghostPassword = await bcrypt.hash("Password123", 10);
    const ghost = await User.create({
      name: "Ghost",
      email: "guest-9841000004@guest.letsgocab.local",
      phone: "9841000004",
      password: ghostPassword,
      role: "customer",
    });
    const booking = await Booking.create(
      assignedBookingDoc({ customer: ghost._id })
    );

    const res = await notifyCustomerOfAssignment(booking._id, fakeTransportFactory);

    expect(res.sent).toBe(false);
    expect(res.skipped).toBe("no-recipient");
    expect(sentMails).toHaveLength(0);
  });

  it("skips gracefully without a driver, a booking, or mail config", async () => {
    const unassigned = await Booking.create(
      assignedBookingDoc({ driver: null, bookingStatus: "Pending" })
    );
    expect(
      (await notifyCustomerOfAssignment(unassigned._id, fakeTransportFactory)).skipped
    ).toBe("no-driver");

    expect(
      (await notifyCustomerOfAssignment(
        new mongoose.Types.ObjectId().toString(),
        fakeTransportFactory
      )).skipped
    ).toBe("booking-not-found");

    delete process.env.SMTP_HOST;
    const booking = await Booking.create(assignedBookingDoc());
    expect(
      (await notifyCustomerOfAssignment(booking._id, fakeTransportFactory)).skipped
    ).toBe("email-not-configured");
    expect(sentMails).toHaveLength(0);
    process.env.SMTP_HOST = "smtp.test.local";
  });

  it("builders render every booking-details section", async () => {
    const booking = await Booking.create(assignedBookingDoc());
    const fresh = await Booking.findById(booking._id)
      .populate("customer", "name phone email")
      .populate("vehicleType", "name")
      .populate({
        path: "driver",
        select: "user vehicleBrand vehicleModel vehicleColor vehicleNumber",
        populate: { path: "user", select: "name phone" },
      })
      .lean();

    const view = buildAssignmentEmailView(fresh);
    expect(view.ref).toBe(booking._id.toString().slice(-8).toUpperCase());
    expect(view.driverName).toBe("Confirm Driver");
    expect(view.totalFare).toBe(4500);

    const html = buildAssignmentEmailHtml(view);
    for (const needle of [
      "DRIVER ASSIGNED",
      view.ref,
      "Confirm Customer",
      "YOUR TRIP",
      "YOUR DRIVER",
      "Total fare",
      "TN98CN0001",
    ]) {
      expect(html).toContain(needle);
    }
    expect(buildAssignmentEmailText(view)).toMatch(/Total fare/);
  });

  it("driver accept triggers the confirmation without breaking the flow", async () => {
    const driverLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "confirm.driver@example.com", password: "Password123" });

    // Undispatched Pending booking created directly (no route/fare calls).
    const created = await Booking.create({
      customer: customerId,
      pickup: { address: "Trichy, Tamil Nadu", latitude: 10.79, longitude: 78.7 },
      drop: { address: "Chennai, Tamil Nadu", latitude: 13.08, longitude: 80.27 },
      pickupDateTime: new Date(Date.now() + 86400000),
      tripType: "One Way",
      days: 1,
      vehicleType: testVehicle._id,
      distance: 330,
      estimatedFare: 4500,
      paymentMethod: "Cash",
      bookingStatus: "Pending",
      approvalStatus: "Approved",
    });
    const bookingId = created._id.toString();

    const accept = await request(app)
      .patch(`/api/bookings/${bookingId}/accept`)
      .set("Authorization", `Bearer ${driverLogin.body.accessToken}`);
    expect(accept.status).toBe(200);

    const stored = await Booking.findById(bookingId).lean();
    expect(stored.bookingStatus).toBe("Accepted");
    expect(stored.driver.toString()).toBe(driverProfileId.toString());
  });
});
