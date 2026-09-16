import React, { useState, useRef } from "react";
import { FaCarSide, FaRetweet, FaMapMarkerAlt } from "react-icons/fa";
import { motion as Motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import { GOOGLE_MAPS_LIBRARIES } from "../../utils/googleMaps";
import { bookingAPI } from "../../services/endpoints";
import "./Booking.css";

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const Booking = () => {
  const [currentState, setCurrentState] = useState("One Way");

  const [data, setData] = useState({
    location: "",
    destination: "",
    datetime: "",
    days: "",
  });

  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);

  const locationRef = useRef(null);
  const destinationRef = useRef(null);

  const handlePlaceSelect = (type) => {
    const ref = type === "location" ? locationRef : destinationRef;
    const place = ref.current?.getPlace();
    if (place && place.formatted_address) {
      setData((prev) => ({ ...prev, [type]: place.formatted_address }));
      if (place.geometry?.location) {
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        if (type === "location") setPickupCoords(coords);
        else setDropCoords(coords);
      }
    }
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!pickupCoords || !dropCoords) {
      toast.error("Please select locations from the dropdown suggestions.");
      return;
    }
    try {
      const payload = {
        pickup: { address: data.location, latitude: pickupCoords.lat, longitude: pickupCoords.lng },
        drop: { address: data.destination, latitude: dropCoords.lat, longitude: dropCoords.lng },
        pickupDateTime: data.datetime ? new Date(data.datetime).toISOString() : new Date().toISOString(),
        tripType: currentState === "One Way" ? "One Way" : "Round Trip",
        days: currentState === "Round Trip" ? parseInt(data.days) || 1 : 1,
        vehicleType: "000000000000000000000001",
        paymentMethod: "Cash",
      };
      const { data: res } = await bookingAPI.create(payload);
      if (res.success) {
        toast.success("Booking created successfully!");
        setData({ location: "", destination: "", datetime: "", days: "" });
        setPickupCoords(null);
        setDropCoords(null);
      } else {
        toast.error(res.message || "Booking failed!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed!");
    }
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_KEY} libraries={GOOGLE_MAPS_LIBRARIES}>
      <div className="w-full flex items-center justify-center">
        <Motion.div
          initial={{ opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="p-6 sm:p-8 w-full max-w-xl mx-auto rounded-[30px] text-white bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl"
        >
          <div className="flex border border-green-500/30 rounded-2xl overflow-hidden mb-6">
            <Motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentState("One Way")}
              className={`flex items-center justify-center w-1/2 cursor-pointer gap-2 px-6 py-3 font-semibold transition-all duration-200 ${
                currentState === "One Way"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              <FaCarSide />
              One Way
            </Motion.button>
            <Motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentState("Round Trip")}
              className={`flex items-center justify-center w-1/2 cursor-pointer gap-2 px-6 py-3 font-semibold transition-all duration-200 ${
                currentState === "Round Trip"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              <FaRetweet />
              Round Trip
            </Motion.button>
          </div>

          <form onSubmit={handleBooking} className="grid md:grid-cols-1 gap-4 items-end">
            <Motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <label className="text-sm font-medium text-gray-300">Picking Up Location:</label>
              <div className="relative mt-1">
                <FaMapMarkerAlt className="absolute top-1/2 left-3 transform -translate-y-1/2 text-green-400" />
                <Autocomplete
                  onLoad={(autoC) => (locationRef.current = autoC)}
                  onPlaceChanged={() => handlePlaceSelect("location")}
                >
                  <input
                    type="text"
                    name="location"
                    value={data.location}
                    onChange={handleChange}
                    placeholder="Enter a Location"
                    className="w-full bg-white/5 border border-white/10 px-10 py-2.5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition"
                  />
                </Autocomplete>
              </div>
            </Motion.div>

            <Motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
              <label className="text-sm font-medium text-gray-300">Dropping off Location:</label>
              <div className="relative mt-1">
                <FaMapMarkerAlt className="absolute top-1/2 left-3 transform -translate-y-1/2 text-green-400" />
                <Autocomplete
                  onLoad={(autoC) => (destinationRef.current = autoC)}
                  onPlaceChanged={() => handlePlaceSelect("destination")}
                >
                  <input
                    type="text"
                    name="destination"
                    value={data.destination}
                    onChange={handleChange}
                    placeholder="Enter a Location"
                    className="w-full bg-white/5 border border-white/10 px-10 py-2.5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition"
                  />
                </Autocomplete>
              </div>
            </Motion.div>

            <Motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
              <label className="text-sm font-medium text-gray-300">Picking Up Time:</label>
              <input
                type="datetime-local"
                name="datetime"
                value={data.datetime}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 px-3 py-2.5 rounded-xl mt-1 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition [color-scheme:dark]"
              />
            </Motion.div>

            {currentState === "Round Trip" && (
              <Motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <label className="text-sm font-medium text-gray-300">Number of Days:</label>
                <input
                  type="number"
                  name="days"
                  value={data.days}
                  onChange={handleChange}
                  placeholder="e.g., 3"
                  className="w-full bg-white/5 border border-white/10 px-3 py-2.5 rounded-xl mt-1 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition"
                />
              </Motion.div>
            )}

            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="bg-gradient-to-r from-green-500 to-emerald-600 cursor-pointer text-white font-semibold px-6 py-3 rounded-2xl hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all col-span-full md:col-span-1"
            >
              Book Your Ride
            </Motion.button>
          </form>
        </Motion.div>
      </div>
    </LoadScript>
  );
};

export default Booking;
