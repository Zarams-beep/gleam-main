"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const streakData = [
  { name: "1-3 Days", value: 10 },
  { name: "4-7 Days", value: 25 },
  { name: "8-14 Days", value: 40 },
  { name: "15+ Days", value: 20 },
];

const COLORS = ["#B794F4", "#a855f7", "#7e22ce", "#FFD166"];

export default function StreakPieChart() {
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
            {streakData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
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
