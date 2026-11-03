"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { storage } from "@/lib/storage";

type Application = {
 id:string; technicianNumber:number; status:string; serviceAreas:string[];
 specializations:string[]; createdAt:string; reviewedAt?:string|null;
};
export default function TechnicianApplicationPage(){
 const {user,isLoading} = useAuth();
 const [data,setData] = useState<Application|null>(null);
 const [error,setError] = useState("");
 const [loading,setLoading] = useState(true);
 const load = useCallback(async()=>{
   const token=storage.getAccessToken();
   if(!token){setLoading(false);return;}
   setLoading(true);setError("");
   try{
     const r=await fetch("/api/auth/technician/application",{headers:{Authorization:`Bearer ${token}`},cache:"no-store"});
     if(!r.ok) throw new Error("Could not check the technician application status.");
     const body=await r.json();
     setData(body.data||null);
   } catch(e){setError(e instanceof Error?e.message:"Unable to load your application");}
   finally{setLoading(false);}
 },[]);
 useEffect(()=>{if(!isLoading)void load();},[isLoading,load]);
 return <main className="mx-auto max-w-2xl px-5 py-16">
  <Link href="/dashboard" className="text-teal-700 underline">Customer Dashboard</Link>
  <h1 className="mt-6 text-3xl font-bold">Technician application</h1>
  <p className="mt-3 text-gray-600">Your customer account remains active while the FixBari Admin team reviews your technician application.</p>
  {(isLoading||loading)&&<p role="status" className="mt-6">Loading application...</p>}
  {error&&<p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
  {!isLoading&&!user&&<p className="mt-6"><Link href="/login" className="text-teal-800 underline">Sign in to view your application</Link></p>}
  {!loading&&!data&&user&&<p className="mt-6">No technician application was found for this account.</p>}
  {data&&<section className="mt-7 space-y-4 rounded-2xl border bg-white p-6">
    <p><span className="text-gray-500">Technician ID:</span> <strong>FBT-{String(data.technicianNumber).padStart(6,"0")}</strong></p>
    <p><span className="text-gray-500">Application:</span> <strong>{data.status}</strong></p>
    <p><span className="text-gray-500">Skills:</span> {data.specializations.join(", ")||"Not provided"}</p>
    <p><span className="text-gray-500">Service areas:</span> {data.serviceAreas.join(", ")||"Not provided"}</p>
    <p className="text-sm text-gray-600">{data.status==="PENDING"?"Awaiting admin approval. A technician login will only be available after approval.":data.status==="APPROVED"?"Approved. Sign in to the separately hosted Technician Portal with your email and password.":"Your application was not approved. Contact the FixBari administrator if you need help."}</p>
  </section>}
  <button type="button" onClick={()=>void load()} className="mt-6 rounded-xl bg-teal-700 px-5 py-2.5 font-semibold text-white">Refresh status</button>
 </main>;
}
