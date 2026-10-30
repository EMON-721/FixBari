"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import { storage } from "@/lib/storage";
import { Camera, Mail, Phone, MapPin, Shield, CheckCircle2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard";

// The form is populated from the authenticated user endpoint; no example personal data.
const emptyUser = { firstName:"", lastName:"", email:"", phone:"", address:"", area:"", city:"", division:"", postalCode:"", emailVerified:false, createdAt:"" };

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(emptyUser);
  const [message,setMessage] = useState("");
  useEffect(() => {
    const token=storage.getAccessToken();if(!token)return;
    authApi.me(token).then(data => {
      const user=data as Partial<typeof emptyUser>;
      setFormData(prev=>({...prev,...Object.fromEntries(Object.entries(user).map(([key,value])=>[key,value??""]))}));
    }).catch(e=>setMessage(e instanceof Error?e.message:"Could not load account"));
  },[]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token=storage.getAccessToken();if(!token)return;
    setMessage("");
    try {
      await authApi.updateProfile(Object.fromEntries(["firstName","lastName","phone","address","area","city","division","postalCode"].map(key=>[key,String(formData[key as keyof typeof formData]||"")])),token);
      setMessage("Profile saved successfully.");setIsEditing(false);
    }catch(e){setMessage(e instanceof Error?e.message:"Profile update failed");}
  };

  return (
    <>
      <DashboardHeader
        title="Profile"
        description="Manage your personal information"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {message && <p className="p-3 bg-amber-50 rounded-xl" role="status">{message}</p>}
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Cover */}
            <div className="h-32 bg-gradient-to-r from-primary to-amber-500" />

            {/* Profile Info */}
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">
                      {formData.firstName?.[0]||"?"}{formData.lastName?.[0]||""}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Name & Status */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {formData.firstName} {formData.lastName}
                  </h2>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-500">
                      Member since {formData.createdAt}
                    </span>
                    {formData.emailVerified && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-5 py-2.5 font-medium rounded-xl transition-colors ${
                    isEditing
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={true}
                      title="Email changes require a separate verification workflow"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Address Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                {/* Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Division */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Division
                  </label>
                  <input
                    type="text"
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Security
              </h3>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Password</p>
                    <p className="text-sm text-gray-500">Password changes require verification</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => window.location.assign("/forgot-password")}
                  className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
