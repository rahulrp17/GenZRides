import React from "react";
import { Info, Timer, Receipt, XCircle, Route, Wallet } from "lucide-react";

const NOTES = [
  {
    icon: Route,
    title: "Minimum billing",
    text: "One-way trips bill at least 130 km/day; round trips 250 km/day (300 km/day for Bengaluru).",
  },
  {
    icon: Wallet,
    title: "Driver bata",
    text: "₹300/day from day one. One-way/drop: ₹600/day when total running exceeds 400 km. Round trip: ₹300/day always.",
  },
  {
    icon: Timer,
    title: "Waiting charge",
    text: "One-way only. After the driver arrives at pickup and waits over 30 min: ₹2/min (first 30 min free).",
  },
  {
    icon: Receipt,
    title: "Toll + permit",
    text: "One-way only. Toll fee and interstate permit fee apply when applicable, at actuals.",
  },
  {
    icon: XCircle,
    title: "Post-arrival cancellation",
    text: "Cancelling after the driver arrives at pickup: ₹300.",
  },
];

// Shared fare/cancellation policy notes in the premium dark glass style.
// Used on Home popular routes, booking + confirmation price areas, and
// the admin dashboard — single source of truth for the wording.
const FareNotes = ({ compact = false }) => (
  <div className="relative overflow-hidden bg-white/5 backdrop-blur-lg rounded-[26px] border border-white/10 p-5 sm:p-6">
    <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/10 blur-[90px] rounded-full" />
    <div className="relative flex items-center gap-2 mb-4">
      <span className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
        <Info size={15} className="text-emerald-400" />
      </span>
      <h3 className="font-display text-base font-bold text-white tracking-tight">
        Fare notes
      </h3>
    </div>
    <ul className={`relative grid gap-3 ${compact ? "" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
      {NOTES.map((n) => (
        <li
          key={n.title}
          className="flex gap-2.5 bg-black/25 border border-white/10 rounded-2xl p-3.5"
        >
          <n.icon size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-300 leading-relaxed">
            <span className="font-semibold text-white">{n.title}: </span>
            {n.text}
          </p>
        </li>
      ))}
    </ul>
  </div>
);

export default FareNotes;
