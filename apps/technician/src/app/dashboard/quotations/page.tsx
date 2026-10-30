"use client";
import {useCallback,useEffect,useState,type FormEvent} from "react";
import {fetchApi} from "@/lib/api";
import {storage} from "@/lib/storage";

type Quote = {id:string;kind:string;status:string;subject:string;scope:string;area:string;createdAt:string};
export default function QuotationsPage(){
 const [quotes,setQuotes]=useState<Quote[]>([]),[errors,setErrors]=useState(""),[amounts,setAmounts]=useState<Record<string,string>>({}),[scopes,setScopes]=useState<Record<string,string>>({}),[busy,setBusy]=useState("");
 const load=useCallback(async()=>{const token=storage.getAccessToken();if(!token)return;const r=await fetchApi<{success:boolean;data:Quote[]}>("/orders/expansions/opportunities",{token});setQuotes(r.data)},[]);
 useEffect(()=>{load().catch(e=>setErrors(e.message))},[load]);
 async function submit(e:FormEvent,id:string){e.preventDefault();const token=storage.getAccessToken();if(!token)return;setErrors("");setBusy(id);try{await fetchApi(`/orders/expansions/${id}/offers`,{method:"POST",token,body:JSON.stringify({amount:Number(amounts[id]),scope:scopes[id]})});await load();setAmounts(a=>({...a,[id]:""}));setScopes(a=>({...a,[id]:""}));}catch(e){setErrors(e instanceof Error?e.message:"Failed to submit offer")}finally{setBusy("")}}
 return <div className="p-4 lg:p-8 space-y-6"><div><h1 className="text-2xl font-bold">Quotation opportunities</h1><p className="text-gray-500">Open customer scope summaries. Personal customer information is not disclosed.</p></div>{errors&&<div role="alert" className="p-4 bg-red-50 text-red-700 rounded-xl">{errors}</div>}
 <div className="grid lg:grid-cols-2 gap-4">{quotes.map(q=><article className="p-6 bg-white rounded-xl border space-y-3" key={q.id}><h2 className="font-semibold text-lg">{q.subject}</h2><p className="text-sm text-gray-500">{q.area} · {q.status}</p><p>{q.scope}</p><form onSubmit={e=>submit(e,q.id)} className="space-y-3"><label className="block text-sm">Your quote (BDT)<input required min={1} max={10000000} type="number" className="mt-1 p-3 border rounded-lg w-full" value={amounts[q.id]||""} onChange={e=>setAmounts(a=>({...a,[q.id]:e.target.value}))}/></label><label className="block text-sm">Proposed work scope<textarea required maxLength={1500} className="mt-1 p-3 border rounded-lg w-full" value={scopes[q.id]||""} onChange={e=>setScopes(a=>({...a,[q.id]:e.target.value}))}/></label><button disabled={busy===q.id} className="bg-amber-500 rounded-lg py-2 px-4 text-white">{busy===q.id?"Submitting...":"Submit quotation"}</button></form></article>)}{!quotes.length&&<p className="text-gray-500">No available quotations, or your account is not verified yet.</p>}</div></div>;
}
