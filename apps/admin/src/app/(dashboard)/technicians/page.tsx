"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchOrdersApi, fetchApi } from "@/lib/api";
import { storage } from "@/lib/storage";

type Applicant = {
 id:string; technicianNumber:number; status:string; serviceAreas:string[];
 specializations:string[]; experience:string|null; createdAt:string;
 user:{id:string;firstName:string;lastName:string;email:string;phone:string|null;role:string;isActive:boolean}
};
type Tech = {id:string;name:string;phone:string|null;specializations:string[];serviceAreas:string[];isAvailable:boolean;verificationStatus:string;completedJobs:number;rating:number};
export default function TechniciansPage(){
 const [people,setPeople]=useState<Tech[]>([]),[query,setQuery]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState("");
 const [applications,setApplications]=useState<Applicant[]>([]);
 const loadApplications=useCallback(async()=>{
   const token=storage.getAccessToken();if(!token)return;
   const r=await fetchApi<{success:boolean;data:Applicant[]}>("/auth/admin/technician-applications",{token});
   setApplications(r.data);
 },[]);
 async function review(id:string,decision:"APPROVED"|"REJECTED"){
   const token=storage.getAccessToken();if(!token)return;
   setBusy(id);setError("");
   try{
     await fetchApi(`/auth/admin/technician-applications/${id}`,{
       method:"PATCH",token,body:JSON.stringify({decision})
     });
     await Promise.all([loadApplications(),load()]);
   }catch(e){setError(e instanceof Error?e.message:"Could not review application")}
   finally{setBusy("")}
 }

 const load=useCallback(async()=>{const token=storage.getAccessToken();if(!token)return;const r=await fetchOrdersApi<{success:boolean;data:Tech[]}>("/orders/admin/technicians/review",{token});setPeople(r.data)},[]);
 useEffect(()=>{Promise.all([load(),loadApplications()]).catch(e=>setError(e.message))},[load,loadApplications]);
 async function update(id:string,verificationStatus:string){const token=storage.getAccessToken();if(!token)return;setBusy(id);setError("");try{await fetchOrdersApi(`/orders/admin/technicians/${id}/verification`,{method:"PATCH",token,body:JSON.stringify({verificationStatus})});await load();}catch(e){setError(e instanceof Error?e.message:"Update failed")}finally{setBusy("")}}
 const visible=people.filter(x=>`${x.name} ${x.phone} ${x.verificationStatus}`.toLowerCase().includes(query.toLowerCase()));
 return <div className="p-4 sm:p-6 lg:p-8 space-y-6"><h1 className="text-2xl font-bold">Technician verification</h1><p className="text-sm text-gray-600">Only verified, available technicians may receive new jobs or quotation opportunities. Review credentials outside the public dashboard before approving.</p>{error&&<div role="alert" className="rounded-xl p-3 bg-red-50 text-red-700">{error}</div>}
 <section className="space-y-4 rounded-xl border bg-white p-5">
   <h2 className="text-xl font-semibold">Technician Applications</h2>
   <p className="text-sm text-gray-600">Applicants cannot receive jobs until explicitly approved. Approval creates a verified technician record and requires the applicant to sign in again.</p>
   <div className="grid gap-4 lg:grid-cols-2">
     {applications.map(a=><article key={a.id} className="space-y-2 rounded-xl border p-4">
       <div className="flex flex-wrap justify-between gap-2">
         <strong>{a.user.firstName} {a.user.lastName}</strong>
         <span className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-semibold">{a.status}</span>
       </div>
       <p className="text-sm font-semibold">Technician ID: FBT-{String(a.technicianNumber).padStart(6,"0")}</p>
       <p className="text-sm break-words">{a.user.email} · {a.user.phone||"No phone"}</p>
       <p className="text-sm">Skills: {a.specializations.join(", ")||"Not provided"}</p>
       <p className="text-sm">Areas: {a.serviceAreas.join(", ")||"Not provided"}</p>
       <p className="text-sm text-gray-600">Experience: {a.experience||"Not provided"}</p>
       {a.status==="PENDING"&&<div className="flex gap-3 pt-2">
         <button type="button" disabled={busy===a.id||!a.user.isActive}
           onClick={()=>review(a.id,"APPROVED")}
           className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Approve & add technician</button>
         <button type="button" disabled={busy===a.id}
           onClick={()=>review(a.id,"REJECTED")}
           className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 disabled:opacity-50">Reject</button>
       </div>}
     </article>)}
     {!applications.length&&<p className="text-sm text-gray-500">No technician applications yet.</p>}
   </div>
 </section>
 <input aria-label="Search technicians" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search names and status" className="p-3 border rounded-xl w-full max-w-lg"/>
 <div className="grid lg:grid-cols-2 gap-4">{visible.map(x=><article key={x.id} className="rounded-xl border bg-white p-5 space-y-2"><div className="flex justify-between"><strong>{x.name}</strong><span className="text-xs bg-amber-50 px-2 py-1 rounded">{x.verificationStatus}</span></div><p className="text-sm text-gray-500">{x.phone||"No phone"} · {x.serviceAreas.join(", ")||"Area not set"}</p><p className="text-sm">{x.specializations.join(", ")||"No specializations"}</p><p className="text-sm">{x.completedJobs} completed jobs · {x.rating} stars</p><div className="flex gap-2 pt-2">{["VERIFIED","REJECTED","PENDING"].filter(s=>s!==x.verificationStatus).map(s=><button key={s} disabled={busy===x.id} onClick={()=>update(x.id,s)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${s==="VERIFIED"?"bg-green-700 text-white":"bg-gray-100 text-gray-700"}`}>{s==="VERIFIED"?"Approve":s==="REJECTED"?"Reject":"Request re-review"}</button>)}</div></article>)}{!visible.length&&<p className="text-gray-500">No matching technician records.</p>}</div></div>
}
