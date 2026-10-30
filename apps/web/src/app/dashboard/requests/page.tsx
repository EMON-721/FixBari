"use client";

import { useEffect, useState, type FormEvent } from "react";
import { fetchApi, servicesApi } from "@/lib/api";
import { storage } from "@/lib/storage";
import { DashboardHeader } from "@/components/dashboard";

type RequestKind = "EMERGENCY" | "QUOTE" | "PROPERTY" | "APPLIANCE" | "SUPPORT" | "INSPECTION" | "CONTRACT";
type WorkRequest = { id: string; kind: string; status: string; payload: Record<string, unknown>; createdAt: string; offers?: { id: string; amount: string; scope: string; status: string }[] };
type Service = { id: string; name: string; basePrice: number };
const kinds: { id: RequestKind; label: string; helper: string }[] = [
  { id: "EMERGENCY", label: "Emergency service", helper: "Urgent request, not a live dispatch. Call emergency services for immediate danger." },
  { id: "QUOTE", label: "Request a quotation", helper: "Technicians can submit proposed scope and price." },
  { id: "PROPERTY", label: "Property record", helper: "Keep a property's service requirements on file." },
  { id: "APPLIANCE", label: "Appliance record", helper: "Register an appliance and its repair needs." },
  { id: "SUPPORT", label: "Support / complaint", helper: "Raise an issue for admin review." },
  { id: "INSPECTION", label: "Property inspection", helper: "Request an inspection report." },
  { id: "CONTRACT", label: "Commercial contract", helper: "Request an office, apartment or facility service agreement." },
];
const fieldStyle = "w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-300";

export default function RequestsPage() {
  const [kind, setKind] = useState<RequestKind>("QUOTE");
  const [subject, setSubject] = useState("");
  const [area, setArea] = useState("");
  const [details, setDetails] = useState("");
  const [records, setRecords] = useState<WorkRequest[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [complexity, setComplexity] = useState("BASIC");
  const [tier, setTier] = useState("STANDARD");
  const [district, setDistrict] = useState("Dhaka");
  const [estimate, setEstimate] = useState<{min:number;max:number;mid:number}|null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const token = () => storage.getAccessToken();
  const refresh = async () => {
    const access = token(); if (!access) return;
    const response = await fetchApi<{success:boolean;data:WorkRequest[]}>("/orders/expansions", {token:access});
    setRecords(response.data);
  };
  useEffect(() => {
    refresh().catch(e=>setError(e.message));
    servicesApi.getServices().then(data=>{
      const list = Array.isArray(data) ? (data as Service[]) : [];
      setServices(list); if(list.length)setServiceId(list[0].id);
    }).catch(()=>{});
  }, []);
  async function submit(e:FormEvent) {
    e.preventDefault(); const access=token(); if(!access){setError("Sign in to submit a request.");return;}
    setBusy(true);setError("");
    try {
      const payload = kind==="EMERGENCY" ? {service:subject,area,description:details} : kind==="QUOTE" ? {subject,scope:details,area} : {subject,area,description:details};
      await fetchApi("/orders/expansions",{method:"POST",token:access,body:JSON.stringify({kind,payload})});
      setSubject("");setDetails("");await refresh();
    }catch(e){setError(e instanceof Error?e.message:"Request failed");}finally{setBusy(false);}
  }
  async function calculate(e:FormEvent) {
    e.preventDefault(); const access=token(); if(!access)return setError("Sign in to calculate a quote estimate.");
    setError("");try {
      const r=await fetchApi<{success:boolean;data:{min:number;max:number;mid:number}}>("/orders/expansions/estimate",{method:"POST",token:access,body:JSON.stringify({serviceId,complexity,tier,district})});
      setEstimate(r.data);
    }catch(e){setError(e instanceof Error?e.message:"Estimate not available");}
  }
  async function chooseOffer(requestId:string,offerId:string) {
    const access=token();if(!access)return;setBusy(true);setError("");
    try {await fetchApi(`/orders/expansions/${requestId}/offers/${offerId}/select`,{method:"POST",token:access});await refresh();}
    catch(e){setError(e instanceof Error?e.message:"Could not select offer");}finally{setBusy(false);}
  }
  return <><DashboardHeader title="Service Requests" description="Emergency, quotes, property, inspection and support — stored in your account" />
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
      {error && <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>}
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={submit} className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
          <h2 className="text-xl font-bold">New request</h2>
          <div><label htmlFor="request-kind" className="block text-sm font-medium mb-2">Request type</label><select id="request-kind" className={fieldStyle} value={kind} onChange={e=>setKind(e.target.value as RequestKind)}>{kinds.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select><p className="text-xs text-gray-500 mt-2">{kinds.find(x=>x.id===kind)?.helper}</p></div>
          <div><label htmlFor="request-subject" className="block text-sm font-medium mb-2">{kind==="EMERGENCY"?"Service required":"Subject / property / appliance"}</label><input id="request-subject" required maxLength={150} className={fieldStyle} value={subject} onChange={e=>setSubject(e.target.value)} /></div>
          <div><label htmlFor="request-area" className="block text-sm font-medium mb-2">Area / district</label><input id="request-area" maxLength={120} required={kind==="EMERGENCY"} className={fieldStyle} value={area} onChange={e=>setArea(e.target.value)} placeholder="e.g. Mirpur, Dhaka" /></div>
          <div><label htmlFor="request-details" className="block text-sm font-medium mb-2">{kind==="QUOTE"?"Work scope":"Description"}</label><textarea id="request-details" required minLength={10} maxLength={1800} rows={4} className={fieldStyle} value={details} onChange={e=>setDetails(e.target.value)} /></div>
          <button disabled={busy} className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy?"Saving...":"Submit request"}</button>
        </form>
        <form onSubmit={calculate} className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
          <h2 className="text-xl font-bold">Repair cost estimate</h2>
          <p className="text-sm text-gray-600">Rule-based indicative price range — not AI diagnosis, technician quote or guaranteed price.</p>
          <div><label htmlFor="estimate-service" className="block text-sm font-medium mb-2">Service</label><select required id="estimate-service" className={fieldStyle} value={serviceId} onChange={e=>setServiceId(e.target.value)}>{services.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></div>
          <div><label htmlFor="estimate-complexity" className="block text-sm font-medium mb-2">Complexity</label><select id="estimate-complexity" value={complexity} onChange={e=>setComplexity(e.target.value)} className={fieldStyle}><option>BASIC</option><option>MODERATE</option><option>COMPLEX</option></select></div>
          <div><label htmlFor="estimate-tier" className="block text-sm font-medium mb-2">Package</label><select id="estimate-tier" value={tier} onChange={e=>setTier(e.target.value)} className={fieldStyle}><option>STANDARD</option><option>PREMIUM</option><option>DELUXE</option></select></div>
          <div><label htmlFor="estimate-district" className="block text-sm font-medium mb-2">District</label><input id="estimate-district" className={fieldStyle} value={district} onChange={e=>setDistrict(e.target.value)} /></div>
          <button disabled={!serviceId} className="rounded-xl bg-slate-900 px-5 py-3 text-white disabled:opacity-50">Estimate range</button>
          {estimate && <div aria-live="polite" className="bg-amber-50 p-4 rounded-xl"><p className="font-bold text-xl">৳{estimate.min.toLocaleString()} – ৳{estimate.max.toLocaleString()}</p><p className="text-sm">Indicative midpoint ৳{estimate.mid.toLocaleString()} · Material costs may differ</p></div>}
        </form>
      </div>
      <section className="bg-white rounded-2xl border border-gray-100 p-6" aria-label="Request history"><h2 className="text-xl font-bold mb-4">My requests ({records.length})</h2>
        {!records.length?<p className="text-gray-500">No requests yet. New requests will appear here.</p>:<div className="space-y-4">{records.map(item=><article key={item.id} className="rounded-xl border p-4"><div className="flex flex-wrap gap-3 justify-between"><strong>{item.kind} · {String(item.payload.subject || item.payload.service || "Request")}</strong><span className="text-sm text-amber-700">{item.status}</span></div><p className="text-xs text-gray-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p>{item.offers?.map(o=><div key={o.id} className="border-t mt-3 pt-3 flex flex-wrap gap-3 justify-between items-center"><span>Offer ৳{Number(o.amount).toLocaleString()} · {o.scope} ({o.status})</span>{o.status!=="SELECTED"&&item.status!=="ASSIGNED"&&<button disabled={busy} onClick={()=>chooseOffer(item.id,o.id)} className="rounded-lg bg-green-700 text-white px-3 py-2 text-sm">Select offer</button>}</div>)}</article>)}</div>}
      </section>
    </div></>;
}
