"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "@/services/api";

const monthLabels = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

export default function MonthlyFallsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/admin/falls/monthly");
        const counts = res.data.data;

        const formatted = counts.map((count, index) => ({
          month: monthLabels[index],
          falls: count,
        }));

        setData(formatted);
      } catch (err) {
        console.error("Failed to load monthly falls", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3 style={{ marginBottom: 16 }}>Monthly Fall Events</h3>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="falls" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}