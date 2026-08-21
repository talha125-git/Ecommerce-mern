import React from "react";
import { Badge } from "@/components/ui/badge";

export default function OrdersTab({ orders }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Order History</h2>
        <p className="text-xs text-gray-500">Track past orders and delivery progress</p>
      </div>

      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-500 uppercase">
            <tr>
              <th className="p-3.5">Order ID</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5">Total</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-gray-50">
                <td className="p-3.5 font-bold text-gray-900">{ord.id}</td>
                <td className="p-3.5 text-gray-500">{ord.date}</td>
                <td className="p-3.5 font-bold text-gray-900">{ord.total}</td>
                <td className="p-3.5">
                  <Badge variant={ord.status === "Delivered" ? "default" : "secondary"} className="text-[10px]">
                    {ord.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
