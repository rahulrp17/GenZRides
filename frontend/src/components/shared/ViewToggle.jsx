import React from "react";
import { LayoutGrid, List } from "lucide-react";

/**
 * Premium Table/Cards segmented toggle. Controlled — parent owns `view`
 * so switching never touches query/filter/page state (instant, no refetch).
 */
const ViewToggle = ({ view, onChange, labels = { table: "Table", cards: "Cards" } }) => (
  <div
    className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1.5"
    role="tablist"
    aria-label="Change view"
  >
    {[
      { id: "cards", label: labels.cards, icon: LayoutGrid },
      { id: "table", label: labels.table, icon: List },
    ].map((t) => (
      <button
        key={t.id}
        role="tab"
        aria-selected={view === t.id}
        onClick={() => onChange(t.id)}
        className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
          view === t.id
            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_0_18px_rgba(34,197,94,0.35)]"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        <t.icon size={14} />
        {t.label}
      </button>
    ))}
  </div>
);

export default ViewToggle;
