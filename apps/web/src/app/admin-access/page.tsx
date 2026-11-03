import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Admin Access | FixBari",
  description: "FixBari administrator account access and security",
};
export default function AdminAccessPage() {
  return <main className="mx-auto max-w-2xl px-5 py-16">
    <Link href="/register" className="text-sm font-medium text-teal-700">← Back to account types</Link>
    <h1 className="mt-8 text-3xl font-bold text-gray-900">FixBari Admin Access</h1>
    <p className="mt-4 text-gray-700">Admin accounts are restricted to authorized staff. Public registration cannot grant Admin permissions, even when an email matches an administrator's address.</p>
    <div className="mt-8 rounded-2xl border border-teal-200 bg-teal-50 p-6">
      <h2 className="font-semibold">Owner and invited administrators</h2>
      <p className="mt-2 text-sm text-gray-700">Use the separate Admin Portal after your account has been securely provisioned and approved. Login requires an Admin password and, when enabled, an authenticator code.</p>
      <p className="mt-3 text-sm text-gray-700">The Admin Portal is deployed independently of the Customer Website. Do not enter an administrator password into customer registration.</p>
    </div>
    <Link href="/login" className="mt-6 inline-block text-teal-800 underline">Customer login</Link>
  </main>;
}
