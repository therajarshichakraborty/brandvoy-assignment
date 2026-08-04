"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface BowlingChartProps {
  data: Array<{
    playerShortName?: string;
    playerTitle?: string;
    totalWickets: number;
    economy: string | number;
  }>;
}

export function BowlingChart({ data }: BowlingChartProps) {
  const chartData = data.slice(0, 8).map((item) => ({
    name: item.playerShortName || item.playerTitle || "Player",
    Wickets: item.totalWickets,
    Economy: typeof item.economy === "number" ? item.economy : parseFloat(item.economy || "0"),
  }));

  if (!chartData.length) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
        No bowling data available
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11 }} 
            interval={0} 
            angle={-25} 
            textAnchor="end" 
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "rgba(255, 255, 255, 0.95)", 
              borderRadius: "8px", 
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              fontSize: "12px"
            }} 
          />
          <Bar dataKey="Wickets" fill="#0d9488" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
