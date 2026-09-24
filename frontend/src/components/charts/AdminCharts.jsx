import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

const fmtIN = (n) => Number(n || 0).toLocaleString("en-IN");

const AXIS_LABEL = { fontSize: 12, color: "#9ca3af" };
const SPLIT_LINE = { lineStyle: { color: "rgba(255,255,255,0.06)", type: [4, 4] } };
const DARK_TOOLTIP = {
  backgroundColor: "rgba(15,23,42,0.95)",
  borderColor: "rgba(255,255,255,0.1)",
  textStyle: { color: "#fff", fontSize: 12 },
};
const LEGEND = {
  type: "scroll",
  bottom: 0,
  icon: "circle",
  itemWidth: 8,
  itemHeight: 8,
  pageIconColor: "#34d399",
  pageIconInactiveColor: "#4b5563",
  pageTextStyle: { color: "#9ca3af" },
  textStyle: { color: "#9ca3af", fontSize: 12 },
};
const grad = (from, to) =>
  new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: from },
    { offset: 1, color: to },
  ]);

/* ===========================================================
   Responsive ECharts wrapper: resizes with its container on
   every breakpoint (mobile → tablet → desktop) and disposes
   cleanly on unmount.
========================================================== */

const EChart = ({ option, height = 280 }) => {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current, null, { renderer: "canvas" });
    chartRef.current = chart;
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(ref.current);
    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true });
  }, [option]);

  return <div ref={ref} style={{ width: "100%", height }} />;
};

const EmptyChart = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-[260px] text-gray-500 text-sm gap-2">
    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
      <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </div>
    <span>{message}</span>
  </div>
);

const ChartCard = ({ children, title, subtitle, accentColor = "green", className = "" }) => (
  <div className={`relative overflow-hidden bg-white/[0.04] backdrop-blur-xl rounded-[28px] border border-white/[0.08] p-5 sm:p-6 min-w-0 ${className}`}>
    <div className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-${accentColor}-400/50 to-transparent`} />
    <h3 className="font-display text-base font-bold text-white tracking-tight">{title}</h3>
    <p className="text-xs text-gray-500 mt-0.5 mb-4">{subtitle}</p>
    {children}
  </div>
);

const STATUS_COLORS = {
  Pending: "#f59e0b",
  Completed: "#10b981",
  Cancelled: "#ef4444",
  "In Progress": "#818cf8",
};

const AdminCharts = ({ stats = {} }) => {
  const total = Number(stats.totalBookings || 0);
  const pending = Number(stats.pendingBookings || 0);
  const completed = Number(stats.completedBookings || 0);
  const cancelled = Number(stats.cancelledBookings || 0);
  const inProgress = Math.max(0, total - pending - completed - cancelled);

  /* ── Donut: Bookings by Status ───────────────────────────── */
  const statusData = [
    { name: "Pending", value: pending },
    { name: "Completed", value: completed },
    { name: "Cancelled", value: cancelled },
    { name: "In Progress", value: inProgress },
  ];
  const hasStatusData = statusData.some((d) => d.value > 0);
  const statusOption = {
    tooltip: { ...DARK_TOOLTIP, trigger: "item", formatter: (p) => `${p.name}: ${fmtIN(p.value)} (${p.percent}%)` },
    legend: LEGEND,
    series: [
      {
        type: "pie",
        radius: ["55%", "75%"],
        center: ["50%", "44%"],
        avoidLabelOverlap: true,
        // Tiny slices hide their label automatically so nothing overflows
        // on narrow phone screens; values stay one tap away in the tooltip.
        minShowLabelAngle: 18,
        itemStyle: { borderColor: "#0f172a", borderWidth: 2, borderRadius: 6 },
        // Labels live INSIDE the slices (never outside the chart), so the
        // donut stays premium and overlap-free from 320px phones upward.
        label: {
          position: "inside",
          color: "#fff",
          fontSize: 11,
          fontWeight: 600,
          lineHeight: 14,
          formatter: (p) => (p.percent >= 9 ? `${p.name}\n${Math.round(p.percent)}%` : ""),
        },
        labelLine: { show: false },
        emphasis: { scale: true, scaleSize: 4 },
        data: statusData.map((d) => ({
          ...d,
          itemStyle: { color: STATUS_COLORS[d.name] },
        })),
      },
    ],
  };

  /* ── Bar: Revenue by Trip Type ───────────────────────────── */
  const revenueData = [
    { name: "One-Way", value: Number(stats.oneWayRevenue || 0), colors: ["#818cf8", "#6366f1"] },
    { name: "Round-Trip", value: Number(stats.roundTripRevenue || 0), colors: ["#34d399", "#10b981"] },
  ];
  const hasRevenueData = revenueData.some((d) => d.value > 0);
  const revenueOption = {
    tooltip: {
      ...DARK_TOOLTIP,
      trigger: "axis",
      axisPointer: { type: "shadow", shadowStyle: { color: "rgba(255,255,255,0.03)" } },
      valueFormatter: (v) => `₹${fmtIN(v)}`,
    },
    grid: { left: 8, right: 16, top: 12, bottom: 0, containLabel: true },
    xAxis: { type: "category", data: revenueData.map((d) => d.name), axisLabel: AXIS_LABEL, axisLine: { show: false }, axisTick: { show: false } },
    yAxis: {
      type: "value",
      axisLabel: { ...AXIS_LABEL, formatter: (v) => `₹${(v / 1000).toFixed(0)}k` },
      splitLine: SPLIT_LINE,
    },
    series: [
      {
        type: "bar",
        data: revenueData.map((d) => ({
          value: d.value,
          itemStyle: { color: grad(d.colors[0], d.colors[1]), borderRadius: [10, 10, 0, 0] },
        })),
        barWidth: "38%",
      },
    ],
  };

  /* ── Bar: outcome counts (shared builder) ────────────────── */
  const countBarOption = (rows) => ({
    tooltip: {
      ...DARK_TOOLTIP,
      trigger: "axis",
      axisPointer: { type: "shadow", shadowStyle: { color: "rgba(255,255,255,0.03)" } },
      valueFormatter: (v) => fmtIN(v),
    },
    grid: { left: 8, right: 16, top: 12, bottom: 0, containLabel: true },
    xAxis: { type: "category", data: rows.map((d) => d.name), axisLabel: AXIS_LABEL, axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: "value", axisLabel: AXIS_LABEL, splitLine: SPLIT_LINE, minInterval: 1 },
    series: [
      {
        type: "bar",
        data: rows.map((d) => ({
          value: d.value,
          itemStyle: { color: grad(d.from, d.to), borderRadius: [8, 8, 0, 0] },
        })),
        barWidth: "34%",
      },
    ],
  });
  const paint = (name, value) =>
    name === "Pending"
      ? { name, value, from: "#fbbf24", to: "#f59e0b" }
      : name === "Completed"
        ? { name, value, from: "#34d399", to: "#10b981" }
        : { name, value, from: "#f87171", to: "#ef4444" };

  const bookingsStatusRows = [
    paint("Pending", pending),
    paint("Completed", completed),
    paint("Cancelled", cancelled),
    { name: "In Progress", value: inProgress, from: "#818cf8", to: "#6366f1" },
  ];
  const hasBookingsStatusData = bookingsStatusRows.some((d) => d.value > 0);

  const oneWayRows = [
    paint("Pending", Number(stats.oneWayPending || 0)),
    paint("Completed", Number(stats.oneWayCompleted || 0)),
    paint("Cancelled", Number(stats.oneWayCancelled || 0)),
  ];
  const hasOneWayData = oneWayRows.some((d) => d.value > 0);

  const roundTripRows = [
    paint("Pending", Number(stats.roundTripPending || 0)),
    paint("Completed", Number(stats.roundTripCompleted || 0)),
    paint("Cancelled", Number(stats.roundTripCancelled || 0)),
  ];
  const hasRoundTripData = roundTripRows.some((d) => d.value > 0);

  /* ── Line: Weekly One-Way vs Round-Trip ──────────────────── */
  const weeklyData = stats.weeklyData || [];
  const hasWeeklyData = weeklyData.some((d) => d.oneWay > 0 || d.roundTrip > 0);
  const weeklyOption = {
    tooltip: { ...DARK_TOOLTIP, trigger: "axis", valueFormatter: (v) => fmtIN(v) },
    legend: { ...LEGEND, top: 0 },
    grid: { left: 8, right: 16, top: 36, bottom: 0, containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: weeklyData.map((d) => d.day),
      axisLabel: AXIS_LABEL,
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: { type: "value", axisLabel: AXIS_LABEL, splitLine: SPLIT_LINE, minInterval: 1 },
    series: [
      {
        name: "One-Way",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        data: weeklyData.map((d) => d.oneWay),
        lineStyle: { width: 3, color: "#818cf8" },
        itemStyle: { color: "#818cf8", borderColor: "#0f172a", borderWidth: 2 },
        areaStyle: { color: grad("rgba(129,140,248,0.35)", "rgba(129,140,248,0)") },
      },
      {
        name: "Round-Trip",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        data: weeklyData.map((d) => d.roundTrip),
        lineStyle: { width: 3, color: "#34d399" },
        itemStyle: { color: "#34d399", borderColor: "#0f172a", borderWidth: 2 },
        areaStyle: { color: grad("rgba(52,211,153,0.35)", "rgba(52,211,153,0)") },
      },
    ],
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      {/* Row 1 — Donut + Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ChartCard title="Bookings by Status" subtitle="Live distribution from all bookings" accentColor="amber">
          {hasStatusData ? <EChart option={statusOption} height={280} /> : <EmptyChart message="No booking data yet" />}
        </ChartCard>

        <ChartCard title="Revenue by Trip Type" subtitle="Completed booking revenue split" accentColor="emerald">
          {hasRevenueData ? <EChart option={revenueOption} height={280} /> : <EmptyChart message="No revenue data yet" />}
        </ChartCard>
      </div>

      {/* Row 2 — Weekly line + Status bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ChartCard title="Weekly Bookings" subtitle="One-Way vs Round-Trip (last 7 days)" accentColor="purple">
          {hasWeeklyData ? <EChart option={weeklyOption} height={280} /> : <EmptyChart message="No weekly booking data yet" />}
        </ChartCard>

        <ChartCard title="Total Bookings" subtitle="All bookings by current status" accentColor="blue">
          {hasBookingsStatusData ? <EChart option={countBarOption(bookingsStatusRows)} height={280} /> : <EmptyChart message="No booking data yet" />}
        </ChartCard>
      </div>

      {/* Row 3 — One-Way + Round-Trip bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ChartCard title="One-Way Bookings" subtitle="Point-to-point trip breakdown" accentColor="indigo">
          {hasOneWayData ? <EChart option={countBarOption(oneWayRows)} height={260} /> : <EmptyChart message="No one-way booking data yet" />}
        </ChartCard>

        <ChartCard title="Round-Trip Bookings" subtitle="Multi-day round-trip breakdown" accentColor="emerald">
          {hasRoundTripData ? <EChart option={countBarOption(roundTripRows)} height={260} /> : <EmptyChart message="No round-trip booking data yet" />}
        </ChartCard>
      </div>

      {/* Row 4 — Trip Type Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ChartCard title="Trip Type Summary" subtitle="One-way vs round-trip overview" accentColor="purple">
          <div className="flex items-center justify-center h-[260px]">
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 text-center">
                <p className="text-3xl font-display font-bold text-indigo-400">
                  {Number(stats.oneWayBookings || 0)}
                </p>
                <p className="text-xs text-gray-400 mt-1">One-Way</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  ₹{Number(stats.oneWayRevenue || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                <p className="text-3xl font-display font-bold text-emerald-400">
                  {Number(stats.roundTripBookings || 0)}
                </p>
                <p className="text-xs text-gray-400 mt-1">Round-Trip</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  ₹{Number(stats.roundTripRevenue || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminCharts;
