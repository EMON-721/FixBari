"use client";

import { useState } from "react";
import { Save, Bell, Globe, Shield, CreditCard, Mail, Database, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "email", label: "Email", icon: Mail },
    { id: "database", label: "Database", icon: Database },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pl-14 lg:pl-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Review operational settings. Some controls are visual demonstrations until connected to a persisted settings API. Payment gateway statuses must be verified with providers.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            {activeTab === "general" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        defaultValue="FixBari"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Email
                      </label>
                      <input
                        type="email"
                        defaultValue="support@example.invalid"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Phone
                      </label>
                      <input
                        type="tel"
                        defaultValue="+880 1700-000000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Currency
                      </label>
                      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                        <option value="BDT">BDT (৳)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                        <option value="Asia/Dhaka">Asia/Dhaka (UTC+6)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  {[
                    { label: "New booking notifications", description: "Get notified when a new booking is made", enabled: true },
                    { label: "Booking status updates", description: "Receive updates when booking status changes", enabled: true },
                    { label: "New user registrations", description: "Get notified when a new user registers", enabled: false },
                    { label: "New technician applications", description: "Receive alerts for new technician applications", enabled: true },
                    { label: "Payment notifications", description: "Get notified for all payment activities", enabled: true },
                    { label: "Weekly reports", description: "Receive weekly summary reports via email", enabled: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <button
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          item.enabled ? "bg-primary" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            item.enabled ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Change Password</p>
                      <p className="text-sm text-gray-500">Update your admin password</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Active Sessions</p>
                      <p className="text-sm text-gray-500">Manage your active login sessions</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="text-left">
                      <p className="font-medium text-gray-900">API Keys</p>
                      <p className="text-sm text-gray-500">Manage API access keys</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "payments" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Commission (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="15"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Booking Amount
                    </label>
                    <input
                      type="number"
                      defaultValue="500"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="font-medium text-gray-900 mb-4">Payment Gateways</p>
                    <div className="space-y-3">
                      {[
                        { name: "bKash", status: "unverified" },
                        { name: "Nagad", status: "unverified" },
                        { name: "Card Payments", status: "unverified" },
                        { name: "Cash on Delivery", status: "unverified" },
                      ].map((gateway) => (
                        <div key={gateway.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <span className="font-medium text-gray-700">{gateway.name}</span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            gateway.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          }`}>
                            {gateway.status.charAt(0).toUpperCase() + gateway.status.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "email" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      defaultValue="smtp.gmail.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="text"
                        defaultValue="587"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Encryption
                      </label>
                      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                        <option value="tls">TLS</option>
                        <option value="ssl">SSL</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      defaultValue="noreply@example.invalid"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "database" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Management</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="font-medium text-green-700">Database Connected</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">PostgreSQL 15.2 running on localhost:5432</p>
                  </div>
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Backup Database</p>
                      <p className="text-sm text-gray-500">Create a backup of your database</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Restore Database</p>
                      <p className="text-sm text-gray-500">Restore from a previous backup</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                    <div className="text-left">
                      <p className="font-medium text-red-700">Clear Cache</p>
                      <p className="text-sm text-red-600">Clear all cached data</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
