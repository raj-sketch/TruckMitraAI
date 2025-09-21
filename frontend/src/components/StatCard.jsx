import React from "react";

export default function StatCard({ title, value, change }) {
  const positive = Number(change) >= 0;
  const changeText = `${positive ? "+" : ""}${change}%`;
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-800">{value}</div>
      <div className={`text-xs mt-1 ${positive ? "text-green-600" : "text-red-600"}`}>{changeText}</div>
    </div>
  );
}
