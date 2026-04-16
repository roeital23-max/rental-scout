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
        background: "#0D1421",
        border: "1px solid #1e2a3a",
        borderRadius: "8px",
        color: "#e2e8f0",
      }}
    >
      <div className="text-xs text-[#8899AA] mb-0.5">{label}</div>
      <div
        className="font-bold"
        style={{ fontFamily: "var(--font-space-mono), monospace", color: "#00E5A0" }}
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
              <stop offset="5%" stopColor="#00E5A0" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#00E5A0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e2a3a" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#8899AA", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[domainMin, domainMax]}
            tickFormatter={(v) => `₪${(v / 1000).toFixed(1)}k`}
            tick={{ fill: "#8899AA", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#2a3a4a" }} />
          <Area
            type="monotone"
            dataKey="median_price"
            stroke="#00E5A0"
            strokeWidth={2}
            fill="url(#priceGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#00E5A0", stroke: "#0D1421", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
