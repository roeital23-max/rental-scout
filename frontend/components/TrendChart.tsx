"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { TrendPoint } from "@/lib/trendsApi";

type Props = {
  data: TrendPoint[];
  neighborhood: string;
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 text-sm"
      style={{
        background: "#FFFFFF",
        border: "1px solid #DDE4E8",
        borderRadius: "8px",
        color: "#1A2730",
        boxShadow: "0 4px 12px rgba(30,123,123,0.10)",
      }}
    >
      <div className="text-xs mb-0.5" style={{ color: "#637280" }}>{label}</div>
      <div
        className="font-bold"
        style={{ fontFamily: "var(--font-dm-mono), monospace", color: "#1E7B7B" }}
      >
        ₪{payload[0].value.toLocaleString()}
      </div>
    </div>
  );
}

export default function TrendChart({ data, neighborhood }: Props) {
  const prices = data.map((d) => d.median_price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = Math.round((maxPrice - minPrice) * 0.5) || 500;
  const domainMin = Math.max(0, minPrice - padding);
  const domainMax = maxPrice + padding;

  return (
    <div className="w-full" style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1E7B7B" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#1E7B7B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#DDE4E8" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#637280", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[domainMin, domainMax]}
            tickFormatter={(v) => `₪${(v / 1000).toFixed(1)}k`}
            tick={{ fill: "#637280", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#DDE4E8" }} />
          <Area
            type="monotone"
            dataKey="median_price"
            stroke="#1E7B7B"
            strokeWidth={2}
            fill="url(#priceGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#1E7B7B", stroke: "#FFFFFF", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
