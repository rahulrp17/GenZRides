import React from "react";

/**
 * Premium glass table shared by booking list pages. Columns are render
 * props so each page keeps its own cells/actions while sharing chrome.
 * Responsive via horizontal scroll on narrow screens (min-width table).
 *
 * columns: [{ header, cell(row) => node, thClassName?, tdClassName? }]
 * density: "comfortable" (default) or "compact" for denser queues.
 */
const GlassTable = ({ columns, rows, rowKey, minWidth = "820px", density = "comfortable" }) => {
  const compact = density === "compact";
  return (
  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((c) => (
              <th
                key={c.header}
                scope="col"
                className={`${compact ? "px-2.5 py-2" : "px-4 py-3.5"} text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap ${c.thClassName || ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey(row, i)}
              className="border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition-colors"
            >
              {columns.map((c) => (
                <td
                  key={c.header}
                  className={`${compact ? "px-2.5 py-2 text-xs" : "px-4 py-3.5 text-sm"} align-top ${c.tdClassName || ""}`}
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default GlassTable;
