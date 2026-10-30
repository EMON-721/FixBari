"use client";
import {useCallback,useEffect,useState} from "react";
import {fetchApi} from "@/lib/api";
import {storage} from "@/lib/storage";

type User={id:string;email:string;firstName:string;lastName:string;phone:string|null;role:string;isActive:boolean;createdAt:string;emailVerified:boolean};
export default function UsersPage(){
 const [data,setData]=useState<User[]>([]),[search,setSearch]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState("");
 const load=useCallback(async()=>{const token=storage.getAccessToken();if(!token)return;const r=await fetchApi<{success:boolean;data:User[]}>("/auth/admin/users",{token});setData(r.data)},[]);
 useEffect(()=>{load().catch(e=>setError(e.message))},[load]);
 async function change(user:User){const token=storage.getAccessToken();if(!token)return;setBusy(user.id);setError("");try{await fetchApi(`/auth/admin/users/${user.id}/status`,{method:"POST",token,body:JSON.stringify({isActive:!user.isActive})});await load()}catch(e){setError(e instanceof Error?e.message:"Update failed")}finally{setBusy("")}}
 const list=data.filter(x=>`${x.firstName} ${x.lastName} ${x.email} ${x.role}`.toLowerCase().includes(search.toLowerCase()));
 return <div className="p-4 sm:p-6 lg:p-8 space-y-6"><h1 className="text-2xl font-bold">Users</h1><p className="text-gray-600">Real registered users, account status and verification. New accounts must use the registration or controlled onboarding workflow.</p>{error&&<p role="alert" className="p-3 bg-red-50 rounded-lg text-red-700">{error}</p>}
 <input className="border rounded-xl p-3 w-full max-w-lg" aria-label="Search users" placeholder="Search users by email, name or role" value={search} onChange={e=>setSearch(e.target.value)}/>
 <div className="overflow-x-auto rounded-xl border bg-white"><table className="min-w-full text-sm"><thead className="bg-gray-50"><tr>{["Name","Email / phone","Role","Verified","Status","Action"].map(x=><th key={x} className="p-3 text-left">{x}</th>)}</tr></thead><tbody>{list.map(u=><tr key={u.id} className="border-t"><td className="p-3 font-medium">{u.firstName} {u.lastName}</td><td className="p-3">{u.email}<br/><span className="text-gray-500">{u.phone}</span></td><td className="p-3">{u.role}</td><td className="p-3">{u.emailVerified?"Yes":"No"}</td><td className="p-3">{u.isActive?"Active":"Suspended"}</td><td className="p-3"><button disabled={busy===u.id} onClick={()=>change(u)} className={`rounded-lg px-3 py-2 ${u.isActive?"bg-red-50 text-red-700":"bg-green-50 text-green-700"}`}>{u.isActive?"Suspend":"Reactivate"}</button></td></tr>)}</tbody></table>{!list.length&&<div className="p-8 text-gray-500">No matching users</div>}</div></div>
}
