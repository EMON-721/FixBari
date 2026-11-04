"use client";
import Link from "next/link";
import { useOrders } from "@/hooks/use-orders";
export default function NotificationsPage(){
 const orders=useOrders({limit:100});
 const pending=(orders.data?.data||[]).filter(x=>x.status==="PENDING");
 const unassigned=(orders.data?.data||[]).filter(x=>x.status==="CONFIRMED"&&!x.technicianName);
 return <main className="space-y-6 p-4 sm:p-6 lg:p-8">
  <h1 className="text-2xl font-bold">Operational notifications</h1>
  <p className="text-sm text-gray-600">Live actionable booking alerts. Email, push and SMS notifications are not yet activated, so this page does not claim to send them.</p>
  {orders.error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">Cannot load booking alerts. {orders.error.message}</p>}
  {orders.isLoading&&<p className="rounded-xl border bg-white p-4">Checking booking status...</p>}
  <div className="grid gap-4 md:grid-cols-2">
   <section className="rounded-2xl border bg-white p-5"><h2 className="font-semibold">Pending confirmation ({pending.length})</h2><div className="mt-3 space-y-2">{pending.map(x=><p key={x.id} className="border-t py-2 text-sm">{x.bookingId} · {x.serviceName}</p>)}
    {!pending.length&&<p className="text-sm text-gray-500">No pending confirmation alerts.</p>}</div></section>
   <section className="rounded-2xl border bg-white p-5"><h2 className="font-semibold">Awaiting technician assignment ({unassigned.length})</h2><div className="mt-3 space-y-2">{unassigned.map(x=><p key={x.id} className="border-t py-2 text-sm">{x.bookingId} · {x.serviceName}</p>)}
    {!unassigned.length&&<p className="text-sm text-gray-500">No assignment alerts.</p>}</div></section>
  </div>
  <Link href="/bookings" className="font-semibold text-amber-700 underline">Open booking management</Link>
 </main>;
}
