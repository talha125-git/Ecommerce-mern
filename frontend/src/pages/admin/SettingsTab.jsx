import { Button } from '@/components/ui/button';

export default function SettingsTab({ user }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-xs text-gray-500">General account preferences</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Store Name</label>
          <input 
            type="text" 
            defaultValue="BloomShop" 
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Admin Email</label>
          <input 
            type="email" 
            defaultValue={user?.email || "admin@bloomshop.com"} 
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button className="rounded-xl text-xs">Save Settings</Button>
      </div>
    </div>
  );
}
