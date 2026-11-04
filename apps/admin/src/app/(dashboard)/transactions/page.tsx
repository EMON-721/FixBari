"use client";
import { useState } from "react";
import Link from "next/link";
import { useOrders } from "@/hooks/use-orders";
export default function TransactionsPage(){
 const [search,setSearch]=useState("");
 const {data,isLoading,error,refetch}=useOrders({limit:100});
 const rows=(data?.data||[]).filter(x=>[x.bookingId,x.serviceName,x.userName].join(" ").toLowerCase().includes(search.toLowerCase()));
 const total=rows.reduce((sum,x)=>sum+(x.status==="COMPLETED"?x.totalAmount:0),0);
 return <main className="space-y-6 p-4 sm:p-6 lg:p-8">
  <h1 className="text-2xl font-bold">Transactions & COD Ledger</h1>
  <p className="text-sm text-gray-600">Online payment gateway is not active. This ledger shows booking amounts, not verified cash collection or bank transfers.</p>
  <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl border bg-white p-5"><p className="text-sm text-gray-500">Tracked bookings</p><p className="text-2xl font-bold">{data?.pagination.total??0}</p></div>
  <div className="rounded-xl border bg-white p-5"><p className="text-sm text-gray-500">Completed booking value (visible records)</p><p className="text-2xl font-bold">৳{total.toLocaleString()}</p></div>
  <div className="rounded-xl border bg-white p-5"><p className="text-sm text-gray-500">Payment method</p><p className="text-2xl font-bold">Cash on delivery</p></div></div>
  <div className="flex flex-wrap gap-2"><input className="min-w-64 flex-1 rounded-xl border bg-white p-3" placeholder="Find booking or customer" aria-label="Search transactions" value={search} onChange={e=>setSearch(e.target.value)}/>
  <button className="rounded-xl bg-amber-500 px-4 py-2 font-semibold" onClick={()=>void refetch()}>Refresh</button></div>
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error instanceof Error?error.message:"Could not load bookings"}</p>}
  <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[700px] text-left text-sm">
   <thead className="bg-gray-50"><tr>{["Booking","Customer","Service","Value","Booking status","Payment"].map(k=><th className="p-3" key={k}>{k}</th>)}</tr></thead>
   <tbody>{rows.map(x=><tr key={x.id} className="border-t"><td className="p-3 font-mono">{x.bookingId}</td><td className="p-3">{x.userName}</td><td className="p-3">{x.serviceName}</td><td className="p-3">৳{x.totalAmount.toLocaleString()}</td><td className="p-3">{x.status}</td><td className="p-3">COD · collection not independently verified</td></tr>)}</tbody>
  </table>{isLoading&&<p className="p-6">Loading bookings...</p>}{!isLoading&&!rows.length&&<p className="p-6 text-gray-500">No transaction records yet.</p>}</div>
  <Link href="/bookings" className="font-medium text-amber-700 underline">Manage bookings and fulfillment</Link>
 </main>;
}
