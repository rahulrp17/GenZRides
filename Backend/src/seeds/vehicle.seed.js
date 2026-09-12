import mongoose from "mongoose";
import dotenv from "dotenv";
import Vehicle from "../models/Vehicle.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

await Vehicle.deleteMany();

await Vehicle.insertMany([
  {
    name: "Mini",
    seats: 4,
    luggage: 2,
    oneWayBaseFare: 80,
    roundTripBaseFare: 80,
    oneWayBaseKm: 0,
    roundTripBaseKm: 0,
    oneWayPerKm: 12,
    roundTripPerKm: 12,
  },
  {
    name: "Sedan",
    seats: 4,
    luggage: 3,
    oneWayBaseFare: 120,
    roundTripBaseFare: 120,
    oneWayBaseKm: 0,
    roundTripBaseKm: 0,
    oneWayPerKm: 15,
    roundTripPerKm: 15,
  },
  {
    name: "SUV",
    seats: 6,
    luggage: 4,
    oneWayBaseFare: 180,
    roundTripBaseFare: 180,
    oneWayBaseKm: 0,
    roundTripBaseKm: 0,
    oneWayPerKm: 20,
    roundTripPerKm: 20,
  },
  {
    name: "Innova",
    seats: 7,
    luggage: 5,
    oneWayBaseFare: 250,
    roundTripBaseFare: 250,
    oneWayBaseKm: 0,
    roundTripBaseKm: 0,
    oneWayPerKm: 24,
    roundTripPerKm: 24,
    driverAllowance: 500,
  },
  {
    name: "Tempo Traveller",
    seats: 12,
    luggage: 8,
    oneWayBaseFare: 500,
    roundTripBaseFare: 500,
    oneWayBaseKm: 0,
    roundTripBaseKm: 0,
    oneWayPerKm: 30,
    roundTripPerKm: 30,
    driverAllowance: 700,
  },
]);

console.log("Vehicles Seeded Successfully");

process.exit();
