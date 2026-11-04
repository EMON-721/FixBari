"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { storage } from "@/lib/storage";
type Entry={key:string;section:string;value:string;published:boolean};
type Navigation={id:string;role:string;label:string;href:string;isVisible:boolean};
export default function CustomContentPage(){
 const params=useParams<{slug:string}>();
 const [entry,setEntry]=useState<Entry|null>(null),[label,setLabel]=useState("Custom Page");
 const [error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>{
  let active=true;
  async function load(){
   const token=storage.getAccessToken();if(!token)throw new Error("Admin session expired");
   const [entries,links]=await Promise.all([
    fetchApi<{success:boolean;data:Entry[]}>("/auth/site/content",{token}),
    fetchApi<{success:boolean;data:Navigation[]}>("/auth/site/navigation",{token})
   ]);
   const pageKey="page."+params.slug;
   const content=entries.data.find(x=>x.key===pageKey&&x.published);
   const route="/content/"+params.slug;
   const nav=links.data.find(x=>x.href===route&&x.role==="ADMIN"&&x.isVisible);
   if(!nav)throw new Error("This Admin page is not published in navigation.");
   if(!content)throw new Error("This page does not have published content. Add key "+pageKey+" from Content Manager.");
   if(active){setLabel(nav.label);setEntry(content);}
  }
  void load().catch(e=>{if(active)setError(e instanceof Error?e.message:"Could not load page")}).finally(()=>{if(active)setLoading(false)});
  return ()=>{active=false};
 },[params.slug]);
 return <main className="space-y-6 p-4 sm:p-6 lg:p-8">
  <Link href="/content-manager" className="text-sm font-semibold text-amber-700 underline">Manage content</Link>
  <h1 className="text-2xl font-bold">{label}</h1>
  {loading&&<p>Loading published page...</p>}
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">{error}</p>}
  {entry&&<article className="rounded-xl border bg-white p-6"><p className="whitespace-pre-wrap leading-7 text-gray-700">{entry.value}</p></article>}
 </main>;
}
