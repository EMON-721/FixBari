"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchOrdersApi } from "@/lib/api";
import { storage } from "@/lib/storage";

type WorkRequest = { id:string; kind:string; status:string; payload:Record<string,unknown>; customerId:string; assignedTechnicianId:string|null; createdAt:string; offers:{id:string;amount:string;status:string}[] };
const options: Record<string,string[]> = { REQUESTED:["TRIAGED","CANCELLED"], TRIAGED:["ASSIGNED","CANCELLED"], ASSIGNED:["IN_PROGRESS","CANCELLED"], IN_PROGRESS:["RESOLVED","CANCELLED"], RESOLVED:[],CANCELLED:[] };
export default function RequestsAdminPage(){
 const [requests,setRequests]=useState<WorkRequest[]>([]),[error,setError]=useState(""),[busy,setBusy]=useState("");
 const load=useCallback(async()=>{const token=storage.getAccessToken();if(!token)return;const r=await fetchOrdersApi<{success:boolean;data:WorkRequest[]}>("/orders/expansions",{token});setRequests(r.data)},[]);
 useEffect(()=>{load().catch(e=>setError(e.message))},[load]);
 async function setStatus(id:string,status:string){const token=storage.getAccessToken();if(!token)return;setBusy(id);setError("");try{await fetchOrdersApi(`/orders/expansions/${id}/status`,{method:"PATCH",token,body:JSON.stringify({status})});await load()}catch(e){setError(e instanceof Error?e.message:"Update failed")}finally{setBusy("")}}
 return <div className="p-4 sm:p-6 lg:p-8 space-y-6"><div><h1 className="text-2xl font-bold text-gray-900">Service requests</h1><p className="text-gray-500">Emergency, quotes, appliances, support, inspections and contracts</p></div>{error&&<p role="alert" className="bg-red-50 p-4 text-red-700 rounded-xl">{error}</p>}
 <div className="bg-white rounded-2xl border overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50"><tr>{["Type","Request","Customer","Status","Received","Action"].map(x=><th key={x} className="text-left p-4">{x}</th>)}</tr></thead><tbody>{requests.map(x=><tr key={x.id} className="border-t"><td className="p-4 font-semibold">{x.kind}</td><td className="p-4 max-w-sm"><strong>{String(x.payload.subject||x.payload.service||"Request")}</strong><p className="text-gray-500 line-clamp-2">{String(x.payload.scope||x.payload.description||"")}</p></td><td className="p-4 text-xs">{x.customerId}</td><td className="p-4">{x.status}</td><td className="p-4">{new Date(x.createdAt).toLocaleDateString()}</td><td className="p-4"><select aria-label={`Update ${x.id}`} disabled={busy===x.id||!options[x.status]?.length} defaultValue="" key={x.id+x.status} onChange={e=>setStatus(x.id,e.target.value)} className="p-2 border rounded-lg"><option value="">Change status</option>{(options[x.status]||[]).map(v=><option key={v} value={v}>{v}</option>)}</select></td></tr>)}</tbody></table>{!requests.length&&<p className="p-8 text-gray-500">No requests yet.</p>}</div></div>;
}
