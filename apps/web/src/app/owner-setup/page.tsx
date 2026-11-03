"use client";
import { useState } from "react";
export default function OwnerSetupPage() {
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [saving,setSaving]=useState(false);
  async function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(""); setSaving(true);
    try {
      const response=await fetch("/api/auth/owner/initialize",{
        method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",
        body:JSON.stringify(Object.fromEntries(form.entries()))
      });
      const data=await response.json();
      if(!response.ok)throw new Error(data.message||"Setup is unavailable");
      setMessage("Owner initialized. Use the separate Admin Portal to log in and enable two-factor authentication.");
      e.currentTarget.reset();
    }catch(err){setError(err instanceof Error?err.message:"Setup failed");}
    finally{setSaving(false);}
  }
  return <main className="mx-auto max-w-xl px-6 py-14">
    <h1 className="text-3xl font-bold">Owner account initialization</h1>
    <p className="my-5 text-sm text-gray-600">One-time protected setup. Requires OWNER_ADMIN_EMAIL and OWNER_SETUP_SECRET configured privately on the backend. Email alone never creates an admin.</p>
    {message&&<p role="status" className="rounded-lg bg-green-50 p-4">{message}</p>}
    {error&&<p role="alert" className="rounded-lg bg-red-50 p-4">{error}</p>}
    <form onSubmit={submit} className="space-y-4">
      {(["firstName","lastName","email","password","setupSecret"] as const).map(k=><label key={k} className="block text-sm font-medium">
        {({firstName:"First name",lastName:"Last name",email:"Owner email",password:"Admin password",setupSecret:"Private one-time setup secret"})[k]}
        <input required name={k} autoComplete="off" type={k==="password"||k==="setupSecret"?"password":k==="email"?"email":"text"}
          minLength={k==="setupSecret"?32:k==="password"?8:2} className="mt-1 w-full rounded-xl border p-3"/>
      </label>)}
      <button disabled={saving} className="rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white disabled:opacity-50" type="submit">
        {saving?"Submitting...":"Initialize owner once"}
      </button>
    </form>
  </main>;
}
