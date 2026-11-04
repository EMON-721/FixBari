"use client";
import { useState } from "react";
import Link from "next/link";
import { useOverviewStats, useRevenueAnalytics, useTopServices, useTechnicianRankings } from "@/hooks/use-orders";

const money=(value:number)=>"৳"+Number(value||0).toLocaleString("en-BD",{maximumFractionDigits:2});
export default function AnalyticsPage(){
 const [period,setPeriod]=useState<"day"|"week"|"month"|"year">("month");
 const overview=useOverviewStats(),revenue=useRevenueAnalytics(period),top=useTopServices(12),technicians=useTechnicianRankings(12);
 const loading=[overview,revenue,top,technicians].some(q=>q.isLoading);
 const error=[overview,revenue,top,technicians].find(q=>q.error)?.error;
 const data=overview.data?.data,metrics=[
  ["Registered customers",data?.totalUsers??0],["Technicians",data?.totalTechnicians??0],
  ["Active bookings",data?.activeBookings??0],["Completed revenue (MTD)",money(data?.revenueMTD??0)]
 ];
 return <div className="space-y-7 p-4 sm:p-6 lg:p-8">
  <header className="flex flex-wrap items-center justify-between gap-4">
   <div><h1 className="text-2xl font-bold">Analytics</h1><p className="mt-1 text-sm text-gray-600">Live database-derived booking, technician and revenue statistics</p></div>
   <select aria-label="Analytics period" className="rounded-xl border bg-white px-4 py-2" value={period} onChange={e=>setPeriod(e.target.value as typeof period)}>
    {(["day","week","month","year"] as const).map(x=><option key={x} value={x}>{x[0].toUpperCase()+x.slice(1)}</option>)}
   </select>
  </header>
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">Analytics could not be loaded. {error instanceof Error?error.message:"Please retry."}</p>}
  {loading&&<p role="status" className="rounded-xl border bg-white p-4">Loading real analytics...</p>}
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
   {metrics.map(([name,value])=><div key={name} className="rounded-2xl border bg-white p-5"><p className="text-sm text-gray-500">{name}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}
  </div>
  <section className="grid gap-5 lg:grid-cols-2">
   <div className="rounded-2xl border bg-white p-5"><h2 className="text-lg font-semibold">Revenue breakdown</h2>
    <p className="mt-1 text-sm text-gray-500">Only completed bookings are included; COD income is an operational amount, not proof of collection.</p>
    <p className="mt-4 text-3xl font-bold">{money(revenue.data?.data.total??0)}</p>
    <p className="text-sm text-gray-600">Previous period: {money(revenue.data?.data.comparison.previousPeriod??0)}</p>
    <div className="mt-4 space-y-2">{(revenue.data?.data.breakdown||[]).map(r=><div className="flex justify-between border-b py-2 text-sm" key={r.date}><span>{r.date} · {r.orders} jobs</span><strong>{money(r.amount)}</strong></div>)}
    {!revenue.data?.data.breakdown.length&&<p className="mt-4 text-sm text-gray-500">No completed bookings in this period.</p>}</div>
   </div>
   <div className="rounded-2xl border bg-white p-5"><h2 className="text-lg font-semibold">Top booked services</h2>
    <div className="mt-3 space-y-2">{(top.data?.topByBookings||[]).map(x=><div key={x.serviceId} className="flex justify-between border-b py-2 text-sm"><span>{x.name}</span><span>{x.bookings} · {money(x.revenue)}</span></div>)}
    {!top.data?.topByBookings.length&&<p className="text-sm text-gray-500">No completed service bookings to rank.</p>}</div>
   </div>
   <div className="rounded-2xl border bg-white p-5 lg:col-span-2"><h2 className="text-lg font-semibold">Technician performance</h2>
    <div className="mt-3 space-y-2">{(technicians.data?.data||[]).map(x=><div key={x.id} className="flex flex-wrap justify-between gap-2 border-b py-2 text-sm"><span>{x.name}</span><span>{x.jobsCompleted} completed · {x.rating} rating · {money(x.revenue)}</span></div>)}
     {!technicians.data?.data.length&&<p className="text-sm text-gray-500">No approved technician performance history yet.</p>}</div>
   </div>
  </section><Link href="/reports" className="font-semibold text-amber-700 underline">Download booking reports</Link>
 </div>;
}
