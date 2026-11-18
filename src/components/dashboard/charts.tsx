"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  borderRadius: "0.75rem",
  border: "1px solid rgba(201,162,75,0.35)",
  background: "rgba(20,42,30,0.92)",
  color: "#f0dca8",
  fontSize: "0.78rem",
  boxShadow: "0 12px 30px -12px rgba(0,0,0,0.45)",
};

const axisStyle = { fontSize: "0.72rem", fill: "#8a917f" } as const;

/** Champagne-gold revenue bars (vendor & admin overviews). */
export function RevenueBarChart({
  data,
}: {
  data: { month: string; revenue: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="goldBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e8c87e" />
              <stop offset="100%" stopColor="#c9a24b" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,75,0.15)" vertical={false} />
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={48} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(201,162,75,0.08)" }} />
          <Bar dataKey="revenue" fill="url(#goldBar)" radius={[6, 6, 0, 0]} name="Revenue ($)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Order flow line (customer overview & admin analytics). */
export function OrdersAreaChart({
  data,
}: {
  data: { month: string; orders: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7fa56b" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#7fa56b" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,75,0.15)" vertical={false} />
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={48} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#7fa56b"
            strokeWidth={2.5}
            fill="url(#greenArea)"
            name="Orders"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
