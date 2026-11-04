"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { authApi,fetchApi } from "@/lib/api";
import { storage } from "@/lib/storage";

type General={siteName:string;supportEmail:string;supportPhone:string;currency:string;codOnly:boolean};
const fallback:General={siteName:"FixBari",supportEmail:"",supportPhone:"",currency:"BDT",codOnly:true};
export default function SettingsPage(){
 const [data,setData]=useState<General>(fallback);
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false);
 const [error,setError]=useState(""),[message,setMessage]=useState("");
 const [otpUri,setOtpUri]=useState(""),[otpCode,setOtpCode]=useState(""),[otpError,setOtpError]=useState("");
 const [otpBusy,setOtpBusy]=useState(false);
 const load=useCallback(async()=>{
  const token=storage.getAccessToken();if(!token)throw new Error("Admin session expired");
  const result=await fetchApi<{success:boolean;data:{general?:General}}>("/auth/site/settings",{token});
  setData({...fallback,...(result.data.general||{})});
 },[]);
 useEffect(()=>{void load().catch(e=>setError(e instanceof Error?e.message:"Settings unavailable")).finally(()=>setLoading(false))},[load]);
 async function save(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();const token=storage.getAccessToken();if(!token)return setError("Admin session expired");
  setSaving(true);setError("");setMessage("");
  try{const r=await fetchApi<{success:boolean;data:General}>("/auth/site/settings/general",{
    token,method:"PATCH",body:JSON.stringify({siteName:data.siteName,supportEmail:data.supportEmail,supportPhone:data.supportPhone})
  });setData(r.data);setMessage("Settings saved to the FixBari database.");}
  catch(e){setError(e instanceof Error?e.message:"Unable to save settings")}
  finally{setSaving(false)}
 }
 async function setupTwoFactor(){
  const token=storage.getAccessToken();if(!token)return;
  setOtpBusy(true);setOtpError("");
  try{const r=await authApi.setupAdminMfa(token);setOtpUri(r.otpAuthUrl);}
  catch(e){setOtpError(e instanceof Error?e.message:"Could not start authenticator setup")}
  finally{setOtpBusy(false)}
 }
 async function confirmTwoFactor(){
  const token=storage.getAccessToken();if(!token)return;
  setOtpBusy(true);setOtpError("");
  try{await authApi.confirmAdminMfa(token,otpCode);setMessage("Two-factor authentication enabled. Store your recovery information safely.");setOtpUri("");setOtpCode("");}
  catch(e){setOtpError(e instanceof Error?e.message:"Could not confirm authenticator code")}
  finally{setOtpBusy(false)}
 }
 return <main className="space-y-7 p-4 sm:p-6 lg:p-8">
  <header><h1 className="text-2xl font-bold">Settings</h1><p className="mt-2 text-sm text-gray-600">Real database-backed website settings and Admin security</p></header>
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
  {message&&<p role="status" className="rounded-xl bg-green-50 p-4 text-green-800">{message}</p>}
  <section className="rounded-2xl border bg-white p-6">
   <h2 className="text-lg font-semibold">General Site Settings</h2>
   {loading?<p className="mt-4">Loading saved settings...</p>:
   <form onSubmit={save} className="mt-4 max-w-2xl space-y-4">
    {([["siteName","Site name","text"],["supportEmail","Support email","email"],["supportPhone","Support phone","tel"]] as const).map(([key,label,type])=><label key={key} className="block text-sm font-semibold">{label}
     <input className="mt-2 w-full rounded-xl border p-3 font-normal" type={type} maxLength={key==="siteName"?100:key==="supportEmail"?180:35}
      value={data[key]} onChange={e=>setData(prev=>({...prev,[key]:e.target.value}))} required={key==="siteName"}/>
    </label>)}
    <p className="text-sm text-gray-600">Currency: BDT. Payment method: Cash on delivery. Online payments remain disabled.</p>
    <button type="submit" disabled={saving} className="rounded-xl bg-amber-500 px-6 py-3 font-semibold disabled:opacity-50">{saving?"Saving...":"Save settings"}</button>
   </form>}
  </section>
  <section className="rounded-2xl border bg-white p-6 space-y-4">
   <h2 className="text-lg font-semibold">Website Content & Custom Navigation</h2>
   <p className="text-sm text-gray-600">Edit public text and add role-specific content pages. Changes are stored in Neon; existing booking records are not affected.</p>
   <Link className="inline-block rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white" href="/content-manager">Open Content Manager</Link>
  </section>
  <section className="rounded-2xl border bg-white p-6 space-y-4">
   <h2 className="text-lg font-semibold">Admin two-factor authentication</h2>
   <p className="text-sm text-gray-600">Use an authenticator app. Never share its setup link, secret or six-digit verification code.</p>
   <button type="button" disabled={otpBusy} onClick={()=>void setupTwoFactor()} className="rounded-xl border px-5 py-3 font-semibold">Start 2FA Setup</button>
   {otpUri&&<div className="max-w-lg space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
    <p className="text-sm font-semibold">Add this account in an authenticator app:</p>
    <code className="block break-all rounded bg-white p-3 text-xs">{otpUri}</code>
    <label className="block text-sm font-semibold">Authenticator code
      <input value={otpCode} maxLength={6} inputMode="numeric" onChange={e=>setOtpCode(e.target.value)}
       className="mt-2 w-full rounded-lg border p-3" placeholder="6-digit code" />
    </label>
    <button type="button" disabled={otpBusy||!/^[0-9]{6}$/.test(otpCode)} onClick={()=>void confirmTwoFactor()}
      className="rounded-lg bg-amber-500 px-5 py-2 font-semibold disabled:opacity-50">Confirm 2FA</button>
   </div>}
   {otpError&&<p role="alert" className="text-sm text-red-700">{otpError}</p>}
  </section>
  <section className="rounded-2xl border bg-white p-6"><h2 className="text-lg font-semibold">Operational status</h2>
    <p className="mt-2 text-sm text-gray-600">Email delivery, online payment settlement and SMS/push messaging are not enabled by this form. Credentials and providers must be configured and verified separately.</p>
  </section>
 </main>;
}
