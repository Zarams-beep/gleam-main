"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const weeklyData = [
  { day: "Mon", Compliments: 10 },
  { day: "Tue", Compliments: 15 },
  { day: "Wed", Compliments: 18 },
  { day: "Thu", Compliments: 22 },
  { day: "Fri", Compliments: 26 },
  { day: "Sat", Compliments: 30 },
  { day: "Sun", Compliments: 24 },
];

const monthlyData = [
  { week: "W1", Compliments: 40 },
  { week: "W2", Compliments: 60 },
  { week: "W3", Compliments: 55 },
  { week: "W4", Compliments: 80 },
];

const yearlyData = [
  { month: "Jan", Compliments: 120 },
  { month: "Feb", Compliments: 180 },
  { month: "Mar", Compliments: 250 },
  { month: "Apr", Compliments: 200 },
  { month: "May", Compliments: 300 },
  { month: "Jun", Compliments: 450 },
  { month: "Jul", Compliments: 500 },
  { month: "Aug", Compliments: 400 },
  { month: "Sep", Compliments: 480 },
  { month: "Oct", Compliments: 600 },
  { month: "Nov", Compliments: 520 },
  { month: "Dec", Compliments: 700 },
];

export default function PerformanceChart() {
  const [filter, setFilter] = useState<"week" | "month" | "year">("week");
  const [chartMargin, setChartMargin] = useState({ top: 10, right: 30, left: 0, bottom: 0 });

  // Adjust margins based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 500) {
        setChartMargin({ top: 10, right: 0, left: 0, bottom: 0 });
      } else if (window.innerWidth < 768) {
        setChartMargin({ top: 10, right: 10, left: 10, bottom: 0 });
      } else {
        setChartMargin({ top: 10, right: 30, left: 0, bottom: 0 });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getData = () => {
    switch (filter) {
      case "week":
        return weeklyData;
      case "month":
        return monthlyData;
      case "year":
        return yearlyData;
      default:
        return weeklyData;
    }
  };

  const chartKey =
    filter === "week" ? "day" : filter === "month" ? "week" : "month";

  return (
    <div className="performance-container">
      {/* Header */}
      <div className="performance-header">
        <h2 className="">
          Performance Overview
        </h2>

        {/* Filter Toggle */}
        <div className="toggle-container">
          {["week", "month", "year"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as "week" | "month" | "year")}
              className={` ${
                filter === type
                  ? "btn-main"
                  : "btn-subtle"
              }`}
            >
              {type === "week"
                ? "This Week"
                : type === "month"
                ? "This Month"
                : "This Year"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={getData()} margin={chartMargin}>
            <defs>
              <linearGradient id="gleamGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey={chartKey}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              padding={{ left: 0, right: 0 }} 
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              padding={{ top: 0, bottom: 0 }}
            />
            <Tooltip
  contentStyle={{
    backgroundColor: "#fff",
    borderRadius: "10px",        
    border: "none",
    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
    padding: "12px 16px",       
  }}
  labelStyle={{
    color: "#1A1023", 
    fontWeight: 700,
    fontSize: 14,
  }}
  itemStyle={{
    color: "#4f46e5", 
    fontWeight: 500,
    fontSize: 13,
  }}
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
      </div>
    </div>
  );
}
