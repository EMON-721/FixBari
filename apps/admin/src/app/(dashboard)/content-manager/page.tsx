"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { storage } from "@/lib/storage";

type Entry={key:string;section:string;value:string;published:boolean};
type Nav={id:string;role:"ADMIN"|"CUSTOMER"|"TECHNICIAN";label:string;href:string;section:string;sortOrder:number;isVisible:boolean};
type Draft={key:string;section:string;value:string;published:boolean};
const blank:Draft={key:"",section:"Homepage",value:"",published:true};
type NewNav={label:string;slug:string;role:Nav["role"];section:string};
export default function ContentManagerPage(){
 const [tab,setTab]=useState<"content"|"navigation">("content");
 const [entries,setEntries]=useState<Entry[]>([]),[nav,setNav]=useState<Nav[]>([]);
 const [newContent,setNewContent]=useState<Draft>(blank),[newNav,setNewNav]=useState<NewNav>({label:"",slug:"",role:"ADMIN",section:"Custom"});
 const [editing,setEditing]=useState<string|null>(null);
 const [editContent,setEditContent]=useState<Entry|null>(null);
 const [editNav,setEditNav]=useState<Nav|null>(null);
 const [filter,setFilter]=useState("");
 const [error,setError]=useState(""),[info,setInfo]=useState(""),[busy,setBusy]=useState(false);
 const token=()=>storage.getAccessToken();
 const load=useCallback(async()=>{
  const auth=storage.getAccessToken();if(!auth)throw new Error("Session expired; sign in again.");
  const [a,b]=await Promise.all([
   fetchApi<{success:boolean;data:Entry[]}>("/auth/site/content",{token:auth}),
   fetchApi<{success:boolean;data:Nav[]}>("/auth/site/navigation",{token:auth})
  ]);
  setEntries(a.data);setNav(b.data);
 },[]);
 useEffect(()=>{void load().catch(e=>setError(e instanceof Error?e.message:"Cannot load content manager"))},[load]);
 const visible=useMemo(()=>entries.filter(x=>[x.key,x.section,x.value].join(" ").toLowerCase().includes(filter.toLowerCase())),[entries,filter]);
 const visibleNav=useMemo(()=>nav.filter(x=>[x.label,x.role,x.href].join(" ").toLowerCase().includes(filter.toLowerCase())),[nav,filter]);
 const run=async(task:()=>Promise<unknown>,success:string)=>{
  setBusy(true);setError("");setInfo("");
  try{await task();await load();setInfo(success);setEditing(null);setEditContent(null);setEditNav(null);}
  catch(e){setError(e instanceof Error?e.message:"Operation failed")}
  finally{setBusy(false)}
 };
 const createEntry=()=>run(async()=>{
  if(!token())throw new Error("Not authenticated");
  await fetchApi("/auth/site/content",{method:"POST",token:token()!,body:JSON.stringify(newContent)});
  setNewContent(blank);
 },"Content entry created.");
 const saveEntry=()=>run(async()=>{
  if(!editContent||!token())throw new Error("No entry selected");
  await fetchApi("/auth/site/content/"+encodeURIComponent(editContent.key),{
   method:"PATCH",token:token()!,body:JSON.stringify({
    value:editContent.value,section:editContent.section,published:editContent.published
   })
  });
 },"Content updated.");
 const deleteEntry=(item:Entry)=>run(async()=>{
  if(!window.confirm(`Delete content ${item.key}? This action removes the saved entry.`))return;
  await fetchApi("/auth/site/content/"+encodeURIComponent(item.key),{method:"DELETE",token:token()!});
 },"Content removed.");
 const createLink=()=>run(async()=>{
  if(!token())throw new Error("Not authenticated");
  const slug=newNav.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g,"-");
  if(slug.length<2)throw new Error("Provide a valid page slug");
  await fetchApi("/auth/site/navigation",{method:"POST",token:token()!,
   body:JSON.stringify({label:newNav.label,href:"/content/"+slug,role:newNav.role,section:newNav.section,sortOrder:100})
  });
  setNewNav({label:"",slug:"",role:"ADMIN",section:"Custom"});
 },"New navigation link saved.");
 const saveLink=()=>run(async()=>{
  if(!editNav)throw new Error("No navigation selected");
  await fetchApi("/auth/site/navigation/"+editNav.id,{
   method:"PATCH",token:token()!,body:JSON.stringify({
    label:editNav.label,role:editNav.role,section:editNav.section,
    isVisible:editNav.isVisible,sortOrder:editNav.sortOrder
   })
  });
 },"Navigation updated.");
 const deleteLink=(item:Nav)=>run(async()=>{
  if(!window.confirm(`Delete navigation link ${item.label}?`))return;
  await fetchApi("/auth/site/navigation/"+item.id,{method:"DELETE",token:token()!});
 },"Navigation link removed.");
 return <main className="space-y-6 p-4 sm:p-6 lg:p-8">
  <header><h1 className="text-2xl font-bold">Content & Navigation Manager</h1>
  <p className="mt-1 text-sm text-gray-600">Edit published text and custom website pages in the database. Admin-only write permissions; changes can be reversed by editing records.</p></header>
  <div className="flex flex-wrap gap-3">
   {(["content","navigation"] as const).map(v=><button key={v} type="button" onClick={()=>{setTab(v);setEditing(null)}} className={`rounded-xl px-5 py-3 font-semibold ${tab===v?"bg-amber-500":"border bg-white"}`}>{v==="content"?"Text Content":"Custom Navigation"}</button>)}
   <input aria-label="Search content or navigation" placeholder="Search entries" value={filter} onChange={e=>setFilter(e.target.value)} className="min-w-48 flex-1 rounded-xl border bg-white p-3"/>
   <button type="button" disabled={busy} onClick={()=>void load().catch(e=>setError(e.message))} className="rounded-xl border bg-white px-4 py-2">Refresh</button>
  </div>
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
  {info&&<p role="status" className="rounded-xl bg-green-50 p-4 text-green-800">{info}</p>}
  {tab==="content"?<>
   <section className="rounded-2xl border bg-white p-5 space-y-3">
    <h2 className="font-semibold">Add website text</h2>
    <div className="grid gap-3 sm:grid-cols-2">
     <label className="text-sm font-medium">Content key<input className="mt-1 w-full rounded-xl border p-3" value={newContent.key} onChange={e=>setNewContent(p=>({...p,key:e.target.value}))} placeholder="home.hero.title"/></label>
     <label className="text-sm font-medium">Section<input className="mt-1 w-full rounded-xl border p-3" value={newContent.section} onChange={e=>setNewContent(p=>({...p,section:e.target.value}))}/></label>
    </div>
    <textarea aria-label="New content text" rows={3} maxLength={4000} className="w-full rounded-xl border p-3" placeholder="Text to display" value={newContent.value} onChange={e=>setNewContent(p=>({...p,value:e.target.value}))}/>
    <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={newContent.published} onChange={e=>setNewContent(p=>({...p,published:e.target.checked}))}/>Published</label>
    <button type="button" disabled={busy||!newContent.key||!newContent.value} onClick={createEntry} className="ml-4 rounded-xl bg-amber-500 px-5 py-3 font-semibold disabled:opacity-50">Add text</button>
   </section>
   <div className="space-y-3">
    {visible.map(item=><article key={item.key} className="rounded-2xl border bg-white p-5">
     {editing===item.key&&editContent?<div className="space-y-3">
      <p className="font-mono text-sm">{item.key}</p>
      <label className="block text-sm font-semibold">Section<input className="mt-1 w-full rounded-xl border p-3" value={editContent.section} onChange={e=>setEditContent(p=>p&&({...p,section:e.target.value}))}/></label>
      <textarea rows={4} maxLength={4000} className="w-full rounded-xl border p-3" value={editContent.value} onChange={e=>setEditContent(p=>p&&({...p,value:e.target.value}))}/>
      <label className="inline-flex gap-2 items-center"><input type="checkbox" checked={editContent.published} onChange={e=>setEditContent(p=>p&&({...p,published:e.target.checked}))}/>Published</label>
      <div className="flex gap-3"><button onClick={saveEntry} disabled={busy} className="rounded-lg bg-amber-500 px-4 py-2 font-semibold">Save</button><button onClick={()=>setEditing(null)} className="rounded-lg border px-4 py-2">Cancel</button></div>
     </div>:<div className="flex flex-wrap justify-between gap-4"><div className="min-w-0 flex-1"><p className="text-xs text-gray-500">{item.section} · {item.published?"Published":"Draft"}</p><p className="mt-1 break-all font-mono text-sm">{item.key}</p><p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{item.value}</p></div>
     <div className="flex gap-2"><button className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold" onClick={()=>{setEditing(item.key);setEditContent({...item})}}>Edit</button>
      <button className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" onClick={()=>deleteEntry(item)} disabled={busy}>Delete</button></div></div>}
    </article>)}
    {!visible.length&&<p className="rounded-xl border bg-white p-6 text-gray-500">No content entries match your search.</p>}
   </div>
  </>:<>
   <section className="rounded-2xl border bg-white p-5 space-y-3">
    <h2 className="font-semibold">Add custom page link</h2>
    <p className="text-sm text-gray-500">Creates a navigation link to /content/slug. Add a matching published content key called page.slug for the page body.</p>
    <div className="grid gap-3 sm:grid-cols-2">
     <label className="text-sm">Title<input className="mt-1 w-full rounded-xl border p-3" value={newNav.label} onChange={e=>setNewNav(p=>({...p,label:e.target.value}))}/></label>
     <label className="text-sm">Slug<input className="mt-1 w-full rounded-xl border p-3" value={newNav.slug} placeholder="service-guide" onChange={e=>setNewNav(p=>({...p,slug:e.target.value}))}/></label>
     <label className="text-sm">Account role<select className="mt-1 w-full rounded-xl border p-3" value={newNav.role} onChange={e=>setNewNav(p=>({...p,role:e.target.value as Nav["role"]}))}>
      {(["ADMIN","CUSTOMER","TECHNICIAN"] as const).map(role=><option key={role}>{role}</option>)}</select></label>
     <label className="text-sm">Section<input className="mt-1 w-full rounded-xl border p-3" value={newNav.section} onChange={e=>setNewNav(p=>({...p,section:e.target.value}))}/></label>
    </div>
    <button type="button" disabled={busy||!newNav.label||!newNav.slug} onClick={createLink} className="rounded-xl bg-amber-500 px-5 py-3 font-semibold disabled:opacity-50">Add navigation</button>
   </section>
   <div className="space-y-3">{visibleNav.map(item=><article className="rounded-xl border bg-white p-4" key={item.id}>
    {editing===item.id&&editNav?<div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm">Label<input className="mt-1 w-full rounded-lg border p-3" value={editNav.label} onChange={e=>setEditNav(p=>p&&({...p,label:e.target.value}))}/></label>
      <label className="text-sm">Section<input className="mt-1 w-full rounded-lg border p-3" value={editNav.section} onChange={e=>setEditNav(p=>p&&({...p,section:e.target.value}))}/></label>
      <label className="text-sm">Role<select className="mt-1 w-full rounded-lg border p-3" value={editNav.role} onChange={e=>setEditNav(p=>p&&({...p,role:e.target.value as Nav["role"]}))}>{["ADMIN","CUSTOMER","TECHNICIAN"].map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="text-sm">Order<input className="mt-1 w-full rounded-lg border p-3" type="number" min={0} max={10000} value={editNav.sortOrder} onChange={e=>setEditNav(p=>p&&({...p,sortOrder:Number(e.target.value)}))}/></label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={editNav.isVisible} onChange={e=>setEditNav(p=>p&&({...p,isVisible:e.target.checked}))}/>Visible</label>
      <div className="flex gap-2"><button disabled={busy} onClick={saveLink} className="rounded-lg bg-amber-500 px-4 py-2">Save</button><button onClick={()=>setEditing(null)} className="rounded-lg border px-4 py-2">Cancel</button></div>
    </div>:<div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{item.label} <span className="text-xs text-gray-500">({item.role})</span></p><p className="text-sm text-gray-500">{item.href} · {item.section} · {item.isVisible?"Visible":"Hidden"}</p></div>
     <div className="flex gap-2"><Link className="rounded-lg border p-2 text-sm" href={item.href}>Preview</Link><button onClick={()=>{setEditing(item.id);setEditNav({...item})}} className="rounded-lg bg-amber-50 px-3 py-2 text-sm">Edit</button><button disabled={busy} onClick={()=>deleteLink(item)} className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Delete</button></div></div>}
   </article>)}{!visibleNav.length&&<p className="rounded-xl border bg-white p-6 text-gray-500">No custom links created yet.</p>}</div>
  </>}
 </main>;
}
