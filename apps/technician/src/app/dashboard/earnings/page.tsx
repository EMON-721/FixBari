"use client";
import { useEffect, useState } from "react";
import { jobsApi } from "@/lib/api";
import { storage } from "@/lib/storage";

type Overview={currentMonth:{total:number;jobsCompleted:number;averagePerJob:number};previousMonth:{total:number;jobsCompleted:number};percentChange:number;breakdown:Array<{serviceCategory:string;amount:number;jobs:number}>};
export default function EarningsPage(){
 const [data,setData]=useState<Overview|null>(null),[error,setError]=useState("");
 useEffect(()=>{const token=storage.getAccessToken();if(!token)return;jobsApi.getEarnings("month",token).then(r=>setData(r.data as unknown as Overview)).catch(e=>setError(e.message))},[]);
 return <div className="p-4 lg:p-8 max-w-5xl space-y-6"><div><h1 className="text-3xl font-bold">Earnings overview</h1><p className="text-gray-500">Estimated share based on a provisional 70% allocation of completed-job totals. Not actual settled bank payouts.</p></div>{error&&<div role="alert" className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>}
 {!data?<p className="text-gray-500">Loading earning records...</p>:<><div className="grid md:grid-cols-3 gap-4">{[{label:"Current month",value:`৳${data.currentMonth.total.toLocaleString()}`},{label:"Completed jobs",value:String(data.currentMonth.jobsCompleted)},{label:"Average per job",value:`৳${data.currentMonth.averagePerJob.toLocaleString()}`}].map(x=><div key={x.label} className="border rounded-xl p-6 bg-white"><p className="text-sm text-gray-500">{x.label}</p><p className="text-2xl font-bold mt-1">{x.value}</p></div>)}</div><div className="bg-white rounded-xl p-6 border"><h2 className="font-bold mb-4">By service category</h2>{!data.breakdown.length?<p>No completed jobs yet.</p>:<div className="space-y-3">{data.breakdown.map(x=><div key={x.serviceCategory} className="flex justify-between border-b py-2"><span>{x.serviceCategory} ({x.jobs} jobs)</span><strong>৳{x.amount.toLocaleString()}</strong></div>)}</div>}</div></>}
 </div>;
}
