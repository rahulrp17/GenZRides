import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Booking from "../models/Booking.js";
import DriverProfile from "../models/DriverProfile.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGO_PATH = path.join(__dirname, "../assets/logo5.png");

/* ===========================================================
   GENERATE INVOICE PDF
=========================================================== */

export const generateInvoice = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId)
    .populate("customer", "name email phone")
    .populate({
      path: "driver",
      populate: {
        path: "user",
        select: "name phone",
      },
    })
    .lean();

  if (!booking) {
    throw new Error("Booking not found.");
  }

  // Authorization: only the customer who took the ride, the assigned driver,
  // or an admin may download the invoice (which embeds customer PII).
  if (user && user.role !== "admin") {
    const isCustomer =
      booking.customer &&
      booking.customer._id.toString() === user._id.toString();
    let isDriver = false;
    if (booking.driver) {
      const driverProfile = await DriverProfile.findOne({
        _id: booking.driver._id || booking.driver,
        user: user._id,
      });
      isDriver = Boolean(driverProfile);
    }
    if (!isCustomer && !isDriver) {
      throw new Error("You are not authorized to view this invoice.");
    }
  }

  if (booking.bookingStatus !== "Completed") {
    throw new Error(
      "Invoice is available only after ride completion."
    );
  }

  const doc = new PDFDocument({
    margin: 40,
    size: "A4",
  });

  /* ===========================
     HEADER — logo centered, then brand + invoice title
  ========================== */

  try {
    if (fs.existsSync(LOGO_PATH)) {
      const pageW = doc.page.width;
      const logoW = 72;
      const x = (pageW - logoW) / 2;
      doc.image(LOGO_PATH, x, 36, { fit: [logoW, logoW], align: "center", valign: "center" });
      doc.moveDown(4.5);
    }
  } catch {
    // logo missing — continue without it
  }

  doc
    .fontSize(24)
    .fillColor("#059669")
    .text("GenZRides", {
      align: "center",
    });

  doc
    .fontSize(12)
    .fillColor("#334155")
    .text("Ride Invoice", {
      align: "center",
    });

  doc.moveDown(2);

  /* ===========================
     INVOICE DETAILS
  ========================== */

  doc.fontSize(11);

  doc.text(`Invoice No : ${booking._id}`);

  doc.text(
    `Invoice Date : ${new Date().toLocaleString()}`
  );

  doc.text(
    `Booking Date : ${new Date(
      booking.createdAt
    ).toLocaleString()}`
  );

  doc.moveDown();

  /* ===========================
     CUSTOMER
  ========================== */

  doc
    .fontSize(14)
    .fillColor("#0066ff")
    .text("Customer");

  doc
    .fillColor("black")
    .fontSize(11)
    .text(`Name : ${booking.customer.name}`);

  doc.text(`Phone : ${booking.customer.phone}`);

  doc.text(
    `Email : ${booking.customer.email || "-"}`
  );

  doc.moveDown();

  /* ===========================
     DRIVER
  ========================== */

  if (booking.driver) {
    doc
      .fontSize(14)
      .fillColor("#0066ff")
      .text("Driver");

    doc
      .fillColor("black")
      .fontSize(11)
      .text(
        `Name : ${booking.driver.user.name}`
      );

    doc.text(
      `Phone : ${booking.driver.user.phone}`
    );

    doc.moveDown();
  }

  /* ===========================
     TRIP DETAILS
  ========================== */

  doc
    .fontSize(14)
    .fillColor("#0066ff")
    .text("Trip Details");

  doc.fillColor("black").fontSize(11);

  doc.text(
    `Pickup : ${booking.pickup.address}`
  );

  doc.text(`Drop : ${booking.drop.address}`);

  doc.text(
    `Distance : ${booking.distance} km`
  );

  doc.text(
    `Duration : ${booking.duration} mins`
  );

  doc.text(
    `Trip Type : ${booking.tripType}`
  );

  doc.moveDown();

  /* ===========================
     PAYMENT
  ========================== */

  doc
    .fontSize(14)
    .fillColor("#0066ff")
    .text("Payment");

  doc.fillColor("black").fontSize(11);

  doc.text(
    `Payment Method : ${booking.paymentMethod}`
  );

  doc.text(
    `Estimated Fare : Rs.${booking.estimatedFare}`
  );

  doc.text(
    `Final Fare : Rs.${booking.finalFare}`
  );

  doc.text(
    `Tip : Rs.${booking.tipAmount || 0}`
  );

  doc.moveDown();

  /* ===========================
     TOTAL
  ========================== */

  const total =
    booking.finalFare + (booking.tipAmount || 0);

  doc
    .fontSize(18)
    .fillColor("green")
    .text(`TOTAL : Rs.${total}`, {
      align: "right",
    });

  doc.moveDown(2);

  doc
    .fontSize(10)
    .fillColor("gray")
    .text(
      "Thank you for choosing GenZRides.",
      {
        align: "center",
      }
    );

  doc.text("Have a Safe Journey!", {
    align: "center",
  });

  doc.end();

  return doc;
};