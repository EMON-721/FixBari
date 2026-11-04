"use client";
import { useState } from "react";
import { useOrders,useOverviewStats } from "@/hooks/use-orders";
export default function ReportsPage(){
 const [status,setStatus]=useState("all"),[notice,setNotice]=useState("");
 const orders=useOrders({limit:100}),overview=useOverviewStats();
 const rows=(orders.data?.data||[]).filter(o=>status==="all"||o.status===status);
 function exportCsv(){
   if(!orders.data||orders.isLoading)return;
   const safe=(v:unknown)=>{const s=String(v??"");const neutral=/^[=+@\-\t\r]/.test(s)?"'"+s:s;return '"'+neutral.replace(/"/g,'""')+'"';};
   const header=["Booking ID","Customer","Service","Status","Scheduled","Amount BDT","Created"];
   const lines=[header,...rows.map(o=>[o.bookingId,o.userName,o.serviceName,o.status,o.scheduledDate,o.totalAmount,o.createdAt])];
   const csv=lines.map(row=>row.map(safe).join(",")).join("\r\n");
   const url=URL.createObjectURL(new Blob(["\ufeff",csv],{type:"text/csv;charset=utf-8"}));
   const a=document.createElement("a");a.href=url;a.download="fixbari-bookings-"+new Date().toISOString().slice(0,10)+".csv";a.click();
   URL.revokeObjectURL(url);setNotice("CSV prepared from current booking data.");
 }
 return <main className="space-y-6 p-4 sm:p-6 lg:p-8">
  <h1 className="text-2xl font-bold">Reports</h1>
  <p className="text-sm text-gray-600">Export actual booking records; figures are derived from the database and do not imply successful cash collection.</p>
  {orders.error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">Reports unavailable: {orders.error.message}</p>}
  <div className="grid gap-4 sm:grid-cols-3">{[
    ["Registered customers",overview.data?.totalUsers??0],["Active bookings",overview.data?.activeBookings??0],
    ["Completed service value (month)", "৳"+(overview.data?.revenueMTD??0).toLocaleString()]
   ].map(([name,value])=><article className="rounded-xl border bg-white p-5" key={name}><p className="text-sm text-gray-500">{name}</p><p className="mt-2 text-2xl font-bold">{value}</p></article>)}
  </div>
  <section className="rounded-2xl border bg-white p-5 space-y-4"><h2 className="text-lg font-semibold">Booking export</h2>
   <div className="flex flex-wrap gap-3"><select aria-label="Filter report status" value={status} onChange={e=>setStatus(e.target.value)} className="rounded-lg border p-3">
    <option value="all">All statuses</option>{["PENDING","CONFIRMED","ASSIGNED","IN_PROGRESS","COMPLETED","CANCELLED"].map(x=><option key={x}>{x}</option>)}</select>
    <button type="button" disabled={orders.isLoading||!orders.data} onClick={exportCsv} className="rounded-lg bg-amber-500 px-5 py-2 font-semibold disabled:opacity-50">Export bookings CSV</button></div>
   <p className="text-sm text-gray-500">Included: {rows.length} of {orders.data?.pagination.total??0} bookings. Only the first 100 records are loaded per export.</p>
   {notice&&<p role="status" className="text-sm text-green-800">{notice}</p>}
  </section>
 </main>;
}
