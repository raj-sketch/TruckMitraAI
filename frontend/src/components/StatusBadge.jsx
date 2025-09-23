import React from "react";

export default function StatusBadge({ status }) {
  if (!status) return null;

  const statusMap = {
    transit: "bg-yellow-100 text-yellow-700",
    "stand by": "bg-gray-100 text-gray-700",
    delivered: "bg-green-100 text-green-700",
  };
  const normalizedStatus = status.toLowerCase();
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[normalizedStatus] || "bg-gray-100 text-gray-700"}`}
    >
      {status.toUpperCase()}
    </span>
  );
}