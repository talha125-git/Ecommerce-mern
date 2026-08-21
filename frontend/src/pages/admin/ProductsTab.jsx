import { Eye, Edit } from 'lucide-react';

export default function ProductsTab() {
  const products = [
    { name: "Floral Summer Dress", cat: "Clothing", price: "$64.99", stock: "45 items" },
    { name: "Leather Handbag", cat: "Accessories", price: "$89.00", stock: "18 items" },
    { name: "Unisex Denim Jacket", cat: "Outerwear", price: "$110.00", stock: "6 items" },
    { name: "Quartz Watch", cat: "Jewelry", price: "$90.00", stock: "32 items" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Catalog</h1>
          <p className="text-xs text-gray-500">View and manage your store inventory</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase">
            <tr>
              <th className="p-4">Product Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((prod, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-900">{prod.name}</td>
                <td className="p-4 text-gray-600">{prod.cat}</td>
                <td className="p-4 font-semibold text-gray-900">{prod.price}</td>
                <td className="p-4 text-gray-600">{prod.stock}</td>
                <td className="p-4 text-right space-x-2">
                  <button className="text-gray-400 hover:text-blue-600">
                    <Eye className="w-4 h-4 inline" />
                  </button>
                  <button className="text-gray-400 hover:text-amber-600">
                    <Edit className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
