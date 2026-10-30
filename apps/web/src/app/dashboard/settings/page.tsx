"use client";

import { useState } from "react";
import { Bell, Globe, CreditCard, Shield, Trash2, ChevronRight } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard";

// Mock settings
const initialSettings = {
  notifications: {
    emailBookingUpdates: true,
    emailPromotions: false,
    smsBookingUpdates: true,
    smsReminders: true,
  },
  language: "en" as "en" | "bn",
  currency: "BDT" as "BDT" | "USD",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleNotificationChange = (key: keyof typeof settings.notifications) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <>
      <DashboardHeader
        title="Settings"
        description="Manage your account preferences"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-500">Manage how you receive updates</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Booking Updates</p>
                  <p className="text-sm text-gray-500">Receive booking confirmations and status updates via email</p>
                </div>
                <button
                  onClick={() => handleNotificationChange("emailBookingUpdates")}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    settings.notifications.emailBookingUpdates ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      settings.notifications.emailBookingUpdates ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Promotions</p>
                  <p className="text-sm text-gray-500">Receive special offers and promotional emails</p>
                </div>
                <button
                  onClick={() => handleNotificationChange("emailPromotions")}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    settings.notifications.emailPromotions ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      settings.notifications.emailPromotions ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">SMS Booking Updates</p>
                  <p className="text-sm text-gray-500">Get SMS notifications for booking status changes</p>
                </div>
                <button
                  onClick={() => handleNotificationChange("smsBookingUpdates")}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    settings.notifications.smsBookingUpdates ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      settings.notifications.smsBookingUpdates ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">SMS Reminders</p>
                  <p className="text-sm text-gray-500">Receive SMS reminders before your scheduled service</p>
                </div>
                <button
                  onClick={() => handleNotificationChange("smsReminders")}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    settings.notifications.smsReminders ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      settings.notifications.smsReminders ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Language & Region */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Language & Region</h3>
                  <p className="text-sm text-gray-500">Set your preferred language and currency</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Language</p>
                  <p className="text-sm text-gray-500">Choose your preferred language</p>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value as "en" | "bn" })}
                  className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="en">English</option>
                  <option value="bn">বাংলা (Bengali)</option>
                </select>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Currency</p>
                  <p className="text-sm text-gray-500">Choose your preferred currency</p>
                </div>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value as "BDT" | "USD" })}
                  className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="BDT">BDT (৳)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Payment Methods</h3>
                  <p className="text-sm text-gray-500">Manage your saved payment methods</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="font-medium text-gray-700">Add Payment Method</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Security</h3>
                  <p className="text-sm text-gray-500">Manage your account security</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              <button className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="text-left">
                  <p className="font-medium text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-500">Update your account password</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="text-left">
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="text-left">
                  <p className="font-medium text-gray-900">Active Sessions</p>
                  <p className="text-sm text-gray-500">View and manage your logged in devices</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
            <div className="p-6 border-b border-red-100 bg-red-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Danger Zone</h3>
                  <p className="text-sm text-red-600">Irreversible actions</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <button className="w-full flex items-center justify-between p-4 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                <div className="text-left">
                  <p className="font-medium text-red-700">Delete Account</p>
                  <p className="text-sm text-red-500">Permanently delete your account and all data</p>
                </div>
                <ChevronRight className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
