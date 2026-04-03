"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function CategoryChart({
  data,
}: {
  data: { category: string; count: number; regretted: number }[];
}) {
  if (!data.length) return null;
  return (
    <div className="h-64 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="category"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgb(226 232 240)",
            }}
          />
          <Bar dataKey="count" name="Total" fill="rgb(13 148 136)" radius={[6, 6, 0, 0]} />
          <Bar
            dataKey="regretted"
            name="Regretted"
            fill="rgb(190 18 60 / 0.55)"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
