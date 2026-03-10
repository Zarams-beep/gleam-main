// component/Dashboard/DashboardChart2.tsx
// ─── Streak / coins donut chart — driven by real props from dashboard ─────────
"use client";
import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  streak?: number;
  coins?: number;
  loading?: boolean;
}

const COLORS = ["#B794F4", "#a855f7", "#7e22ce", "#FFD166"];

export default function StreakPieChart({ streak = 0, coins = 0, loading }: Props) {
  // Build meaningful segments from real data
  const streakData = useMemo(() => {
    if (streak === 0 && coins === 0) {
      return [{ name: "No activity yet", value: 1 }];
    }
    return [
      { name: "Streak (days)", value: streak },
      { name: "Coins earned",  value: Math.min(coins, 100) }, // cap at 100 for visual balance
    ];
  }, [streak, coins]);

  if (loading) {
    return (
      <div className="streak-chart">
        <div className="chart-skeleton" />
      </div>
    );
  }

  return (
    <div className="streak-chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={streakData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            paddingAngle={3}
            label
          >
            {streakData.map((_, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff", borderRadius: "10px",
              border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.15)", padding: "12px 16px",
            }}
            labelStyle={{ color: "#1A1023", fontWeight: 700, fontSize: 14 }}
            itemStyle={{ color: "#4f46e5", fontWeight: 500, fontSize: 13 }}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: "#1A1023" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
