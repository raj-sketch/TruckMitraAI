import React from "react";

export default function StatusBadge({ status }) {
  if (!status) return null;

  const statusMap = {
    active: "bg-blue-100 text-blue-700",
    "in-transit": "bg-yellow-100 text-yellow-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  const normalizedStatus = status.toLowerCase().replace("_", "-");
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[normalizedStatus] || "bg-gray-100 text-gray-700"}`}
    >
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
}