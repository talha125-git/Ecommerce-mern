export default function CustomersTab() {
  const customers = [
    { name: "Sarah Jenkins", email: "sarah@example.com", orders: "12 Orders" },
    { name: "Michael Chen", email: "michael@example.com", orders: "8 Orders" },
    { name: "Emma Watson", email: "emma@example.com", orders: "5 Orders" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-xs text-gray-500">Registered store users</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {customers.map((c, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{c.name}</h3>
              <p className="text-xs text-gray-500">{c.email}</p>
            </div>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {c.orders}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
