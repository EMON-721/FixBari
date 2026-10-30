"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchOrdersApi } from "@/lib/api";
import { storage } from "@/lib/storage";

type Tech = {id:string;name:string;phone:string|null;specializations:string[];serviceAreas:string[];isAvailable:boolean;verificationStatus:string;completedJobs:number;rating:number};
export default function TechniciansPage(){
 const [people,setPeople]=useState<Tech[]>([]),[query,setQuery]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState("");
 const load=useCallback(async()=>{const token=storage.getAccessToken();if(!token)return;const r=await fetchOrdersApi<{success:boolean;data:Tech[]}>("/orders/admin/technicians/review",{token});setPeople(r.data)},[]);
 useEffect(()=>{load().catch(e=>setError(e.message))},[load]);
 async function update(id:string,verificationStatus:string){const token=storage.getAccessToken();if(!token)return;setBusy(id);setError("");try{await fetchOrdersApi(`/orders/admin/technicians/${id}/verification`,{method:"PATCH",token,body:JSON.stringify({verificationStatus})});await load();}catch(e){setError(e instanceof Error?e.message:"Update failed")}finally{setBusy("")}}
 const visible=people.filter(x=>`${x.name} ${x.phone} ${x.verificationStatus}`.toLowerCase().includes(query.toLowerCase()));
 return <div className="p-4 sm:p-6 lg:p-8 space-y-6"><h1 className="text-2xl font-bold">Technician verification</h1><p className="text-sm text-gray-600">Only verified, available technicians may receive new jobs or quotation opportunities. Review credentials outside the public dashboard before approving.</p>{error&&<div role="alert" className="rounded-xl p-3 bg-red-50 text-red-700">{error}</div>}
 <input aria-label="Search technicians" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search names and status" className="p-3 border rounded-xl w-full max-w-lg"/>
 <div className="grid lg:grid-cols-2 gap-4">{visible.map(x=><article key={x.id} className="rounded-xl border bg-white p-5 space-y-2"><div className="flex justify-between"><strong>{x.name}</strong><span className="text-xs bg-amber-50 px-2 py-1 rounded">{x.verificationStatus}</span></div><p className="text-sm text-gray-500">{x.phone||"No phone"} · {x.serviceAreas.join(", ")||"Area not set"}</p><p className="text-sm">{x.specializations.join(", ")||"No specializations"}</p><p className="text-sm">{x.completedJobs} completed jobs · {x.rating} stars</p><div className="flex gap-2 pt-2">{["VERIFIED","REJECTED","PENDING"].filter(s=>s!==x.verificationStatus).map(s=><button key={s} disabled={busy===x.id} onClick={()=>update(x.id,s)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${s==="VERIFIED"?"bg-green-700 text-white":"bg-gray-100 text-gray-700"}`}>{s==="VERIFIED"?"Approve":s==="REJECTED"?"Reject":"Request re-review"}</button>)}</div></article>)}{!visible.length&&<p className="text-gray-500">No matching technician records.</p>}</div></div>
}
