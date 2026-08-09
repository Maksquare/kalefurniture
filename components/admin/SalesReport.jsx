"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchSalesReport } from "@/app/actions/admin";
import {
  PiChartBarLight,
  PiArrowUpRight,
  PiArrowDownRight,
  PiCurrencyDollar,
  PiShoppingBagLight,
  PiCalendarLight,
  PiTrendUp,
  PiPackageLight,
  PiSpinnerGap,
} from "react-icons/pi";

/* ────────────────────────────────────────
   Helpers
──────────────────────────────────────── */
const fmt = (n) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(1)}K`
    : String(Math.round(n));

/* ────────────────────────────────────────
   KPI Card
──────────────────────────────────────── */
function KpiCard({ icon: Icon, label, value, sub, highlight, loading }) {
  return (
    <div
      className={`bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 border shadow-sm flex flex-col gap-4 transition-shadow hover:shadow-md ${
        highlight
          ? "border-gold/30 shadow-[0_0_0_1px_rgba(217,182,110,0.15)]"
          : "border-secondary/10"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 ${
            highlight ? "bg-gold/10 text-gold" : "bg-secondary/5 text-secondary/60"
          }`}
        >
          <Icon className="text-2xl" />
        </div>
        {sub !== undefined && !loading && (
          <span
            className={`flex items-center gap-1 font-secondary text-[11px] font-bold px-2 py-1 rounded-full ${
              sub >= 0
                ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                : "text-red-600 bg-red-50 border border-red-100"
            }`}
          >
            {sub >= 0 ? <PiArrowUpRight size={12} /> : <PiArrowDownRight size={12} />}
            {Math.abs(sub).toFixed(0)}% MoM
          </span>
        )}
      </div>

      <div>
        <p className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/40 mb-1">
          {label}
        </p>
        {loading ? (
          <div className="h-7 w-2/3 rounded-lg bg-secondary/8 animate-pulse" />
        ) : (
          <p className="font-primary text-[28px] md:text-[32px] text-secondary font-medium leading-none">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────
   Revenue Bar Chart (pure CSS)
──────────────────────────────────────── */
function RevenueChart({ months, loading }) {
  const max = Math.max(...(months?.map((m) => m.revenue) || [1]), 1);

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-secondary/10 p-5 md:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/40 mb-1">
            Revenue Trend
          </p>
          <h3 className="font-primary text-[20px] md:text-[24px] text-secondary">
            Last 6 Months
          </h3>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
          <PiChartBarLight className="text-xl" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-end gap-3 h-40">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-xl bg-secondary/6 animate-pulse"
              style={{ height: `${30 + Math.random() * 60}%` }}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-end gap-2 md:gap-3 h-40">
          {months?.map((m, i) => {
            const isLast = i === months.length - 1;
            const heightPct = max > 0 ? (m.revenue / max) * 100 : 4;
            return (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="relative w-full flex justify-center">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="bg-secondary text-white font-secondary text-[10px] px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                      {m.revenue > 0 ? `${fmt(m.revenue)} ETB` : "No sales"}
                    </div>
                  </div>
                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-xl transition-all duration-700 ${
                      isLast
                        ? "bg-gold shadow-[0_4px_12px_rgba(217,182,110,0.4)]"
                        : "bg-secondary/10 group-hover:bg-secondary/20"
                    }`}
                    style={{
                      height: `${Math.max(heightPct, 4)}%`,
                      minHeight: "6px",
                    }}
                  />
                </div>
                <span
                  className={`font-secondary text-[10px] tracking-wide ${
                    isLast ? "text-gold font-bold" : "text-secondary/40"
                  }`}
                >
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────
   Top Products Table
──────────────────────────────────────── */
function TopProductsTable({ products, loading }) {
  const maxSales = Math.max(...(products?.map((p) => p.sales_count || 0) || [1]), 1);

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-secondary/10 p-5 md:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/40 mb-1">
            Best Sellers
          </p>
          <h3 className="font-primary text-[20px] md:text-[24px] text-secondary">
            Top 5 Products
          </h3>
        </div>
        <div className="w-10 h-10 rounded-xl bg-secondary/5 text-secondary/60 flex items-center justify-center">
          <PiTrendUp className="text-xl" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-secondary/5 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-secondary/8 rounded w-1/2" />
                <div className="h-2 bg-secondary/5 rounded w-full" />
              </div>
              <div className="h-4 w-12 bg-secondary/8 rounded" />
            </div>
          ))}
        </div>
      ) : products?.length === 0 ? (
        <div className="py-10 flex flex-col items-center gap-2 text-center">
          <PiPackageLight className="text-4xl text-secondary/20" />
          <p className="font-secondary text-[13px] text-secondary/40">
            No product sales data yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product, idx) => {
            const sales = product.sales_count || 0;
            const barPct = maxSales > 0 ? (sales / maxSales) * 100 : 0;
            const imgSrc =
              Array.isArray(product.images)
                ? product.images[0]
                : typeof product.images === "string"
                ? product.images
                : null;

            return (
              <div key={product.id || product.name || `top-prod-${idx}`} className="flex items-center gap-3">
                {/* Rank */}
                <span className="font-secondary text-[11px] font-bold text-secondary/30 w-4 shrink-0 text-center">
                  {idx + 1}
                </span>

                {/* Image */}
                <div className="w-10 h-10 rounded-xl bg-secondary/5 overflow-hidden shrink-0 border border-secondary/8">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply p-1"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary/20">
                      <PiPackageLight size={16} />
                    </div>
                  )}
                </div>

                {/* Info + Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1.5">
                    <p className="font-secondary text-[13px] font-semibold text-secondary truncate">
                      {product.name}
                    </p>
                    <span className="font-secondary text-[11px] font-bold text-gold shrink-0">
                      {sales} sold
                    </span>
                  </div>
                  {/* Visual progress bar */}
                  <div className="h-1.5 w-full bg-secondary/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold transition-all duration-700"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                  <p className="font-secondary text-[10px] text-secondary/40 mt-1 capitalize">
                    {product.category || "Uncategorized"} · {(product.price || 0).toLocaleString()} ETB
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────
   Main SalesReport Component
──────────────────────────────────────── */
export default function SalesReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchSalesReport();
    if (res.success) {
      setReport(res.data);
      setLastUpdated(new Date());
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  // Compute MoM change for revenue
  const months = report?.monthlyRevenue || [];
  const prevRev = months[months.length - 2]?.revenue || 0;
  const currRev = months[months.length - 1]?.revenue || 0;
  const revMoM = prevRev > 0 ? ((currRev - prevRev) / prevRev) * 100 : null;

  const kpis = [
    {
      icon: PiShoppingBagLight,
      label: "Total Orders",
      value: loading ? "—" : String(report?.totalOrders ?? 0),
    },
    {
      icon: PiCurrencyDollar,
      label: "Total Revenue",
      value: loading ? "—" : `${fmt(report?.totalRevenue ?? 0)} ETB`,
      highlight: true,
    },
    {
      icon: PiCalendarLight,
      label: "This Month Orders",
      value: loading ? "—" : String(report?.thisMonthOrders ?? 0),
    },
    {
      icon: PiTrendUp,
      label: "This Month Revenue",
      value: loading ? "—" : `${fmt(report?.thisMonthRevenue ?? 0)} ETB`,
      sub: revMoM,
      highlight: currRev > prevRev,
    },
  ];

  return (
    <section className="mt-10 md:mt-14">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h2 className="font-primary text-[24px] md:text-[28px] text-secondary">
            Sales <em className="text-gold not-italic font-semibold">Report</em>
          </h2>
          <p className="font-secondary text-[13px] text-secondary/50 mt-0.5">
            {lastUpdated
              ? `Last updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "Loading data from database…"}
          </p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-full border border-secondary/15 font-secondary text-[11px] font-bold uppercase tracking-widest text-secondary/60 hover:border-gold hover:text-gold transition-all disabled:opacity-40"
        >
          <PiSpinnerGap className={`text-base ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 font-secondary text-[13px]">
          ⚠️ {error}. Make sure the{" "}
          <code className="bg-red-100 px-1 rounded">orders</code> table exists in Supabase.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6 md:mb-8">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} {...kpi} loading={loading} />
        ))}
      </div>

      {/* Chart + Top Products side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
        <RevenueChart months={report?.monthlyRevenue} loading={loading} />
        <TopProductsTable products={report?.topProducts} loading={loading} />
      </div>
    </section>
  );
}
