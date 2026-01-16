"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DataItem {
  governorate: string;
  count: number;
}

interface MembersByGovernorateChartProps {
  data: DataItem[];
}

const COLORS = [
  "#1e3a5f",
  "#2d5a87",
  "#3d7aaf",
  "#4a90a4",
  "#5ba3b5",
  "#6db6c6",
  "#7ec9d7",
  "#8fdce8",
];

export default function MembersByGovernorateChart({
  data,
}: MembersByGovernorateChartProps) {
  // Take top 10 governorates
  const topData = data.slice(0, 10);

  return (
    <div className="w-full h-[300px] sm:h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={topData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 12 }} />
          <YAxis
            dataKey="governorate"
            type="category"
            tick={{ fill: "#374151", fontSize: 11 }}
            width={75}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
            formatter={(value) => [`${value ?? 0} عضو`, "العدد"]}
            labelStyle={{ fontWeight: "bold", marginBottom: 4 }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {topData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
