import { Badge } from '@/components/ui/badge';

export default function OrdersTab() {
  const orders = [
    { id: "#ORD-9482", name: "Sarah Jenkins", total: "$129.98", status: "Processing" },
    { id: "#ORD-9481", name: "Michael Chen", total: "$89.50", status: "Shipped" },
    { id: "#ORD-9480", name: "Emma Watson", total: "$45.00", status: "Delivered" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recent Orders</h1>
        <p className="text-xs text-gray-500">Track incoming customer orders</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((ord, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-900">{ord.id}</td>
                <td className="p-4 text-gray-800 font-medium">{ord.name}</td>
                <td className="p-4 font-bold text-gray-900">{ord.total}</td>
                <td className="p-4">
                  <Badge variant={ord.status === 'Delivered' ? 'default' : 'secondary'} className="text-[10px]">
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
