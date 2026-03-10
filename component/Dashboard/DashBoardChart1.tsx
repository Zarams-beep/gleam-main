// component/Dashboard/DashBoardChart1.tsx
// ─── Performance chart — fetches real org stats from /api/stats/org ──────────
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { statsApi } from "@/utils/api";
import { useMediaQuery } from "@/component/hooks/useMediaQuery";

type Filter = "week" | "month" | "year";

// Fallback shapes when API data is unavailable
const EMPTY_WEEK  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => ({ day: d, Compliments: 0 }));
const EMPTY_MONTH = ["W1","W2","W3","W4"].map(w => ({ week: w, Compliments: 0 }));
const EMPTY_YEAR  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  .map(m => ({ month: m, Compliments: 0 }));

export default function PerformanceChart() {
  const [filter, setFilter]         = useState<Filter>("week");
  const [orgStats, setOrgStats]     = useState<any>(null);
  const [loading, setLoading]       = useState(true);

  // ✅ useMediaQuery replaces the manual resize listener
  const isSmall  = useMediaQuery("(max-width: 499px)");
  const isMedium = useMediaQuery("(max-width: 767px)");
  const chartMargin = isSmall
    ? { top: 10, right: 0,  left: 0,  bottom: 0 }
    : isMedium
    ? { top: 10, right: 10, left: 10, bottom: 0 }
    : { top: 10, right: 30, left: 0,  bottom: 0 };

  useEffect(() => {
    statsApi.org()
      .then(({ orgStats }) => setOrgStats(orgStats))
      .catch(() => setOrgStats(null))
      .finally(() => setLoading(false));
  }, []);

  // Build chart data from real org stats — fall back to zeros if unavailable
  const getData = useCallback(() => {
    if (!orgStats) {
      if (filter === "week")  return EMPTY_WEEK;
      if (filter === "month") return EMPTY_MONTH;
      return EMPTY_YEAR;
    }

    // Backend returns complimentsByDepartment; use total for the trend line
    const total = orgStats.totalCompliments ?? 0;

    if (filter === "week") {
      // Distribute total across days proportionally (real breakdown needs a
      // dedicated endpoint — this is a reasonable approximation until then)
      return EMPTY_WEEK.map(d => ({ ...d, Compliments: Math.round(total / 7) }));
    }
    if (filter === "month") {
      return EMPTY_MONTH.map(w => ({ ...w, Compliments: Math.round(total / 4) }));
    }
    return EMPTY_YEAR.map(m => ({ ...m, Compliments: Math.round(total / 12) }));
  }, [filter, orgStats]);

  const chartKey = filter === "week" ? "day" : filter === "month" ? "week" : "month";

  return (
    <div className="performance-container">
      <div className="performance-header">
        <h2>Performance Overview</h2>

        <div className="toggle-container">
          {(["week", "month", "year"] as Filter[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={filter === type ? "btn-main" : "btn-subtle"}
            >
              {type === "week" ? "This Week" : type === "month" ? "This Month" : "This Year"}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-box">
        {loading ? (
          <div className="chart-skeleton" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getData()} margin={chartMargin}>
              <defs>
                <linearGradient id="gleamGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor="#a855f7" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey={chartKey}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff", borderRadius: "10px",
                  border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.15)", padding: "12px 16px",
                }}
                labelStyle={{ color: "#1A1023", fontWeight: 700, fontSize: 14 }}
                itemStyle={{ color: "#4f46e5", fontWeight: 500, fontSize: 13 }}
              />
              <Area
                type="monotone"
                dataKey="Compliments"
                stroke="#1A1023"
                strokeWidth={3}
                fill="url(#gleamGradient)"
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
