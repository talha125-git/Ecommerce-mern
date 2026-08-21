import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfileTab({ profileData, setProfileData, profileSaved, handleSaveProfile }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
        <p className="text-xs text-gray-500">Manage personal info and shipping defaults</p>
      </div>

      {profileSaved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-xl"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Email Address</label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            className="w-full px-3 py-2 border rounded-xl"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
          <input
            type="text"
            value={profileData.phone}
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            className="w-full px-3 py-2 border rounded-xl"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Default Address</label>
          <input
            type="text"
            value={profileData.address}
            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
            className="w-full px-3 py-2 border rounded-xl"
          />
        </div>
        <Button type="submit" className="rounded-xl text-xs">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
