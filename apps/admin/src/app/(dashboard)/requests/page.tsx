"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchOrdersApi } from "@/lib/api";
import { storage } from "@/lib/storage";

type Offer = { id: string; amount: string; status: string; scope?: string; technicianId?: string };
type WorkRequest = {
  id: string;
  kind: string;
  status: string;
  payload: Record<string, unknown>;
  customerId: string;
  assignedTechnicianId: string | null;
  createdAt: string;
  offers: Offer[];
};
const transitions: Record<string, string[]> = {
  REQUESTED: ["TRIAGED", "CANCELLED"],
  TRIAGED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["RESOLVED", "CANCELLED"],
  RESOLVED: [],
  CANCELLED: [],
};
const formatValue = (value: unknown) =>
  typeof value === "string" ? value : JSON.stringify(value);

export default function RequestsAdminPage() {
  const [requests, setRequests] = useState<WorkRequest[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const load = useCallback(async () => {
    const token = storage.getAccessToken();
    if (!token) throw new Error("Admin session expired. Please sign in again.");
    const response = await fetchOrdersApi<{ success: boolean; data: WorkRequest[] }>(
      "/orders/expansions", { token }
    );
    if (!response.success || !Array.isArray(response.data)) throw new Error("Unable to load requests.");
    setRequests(response.data);
  }, []);
  useEffect(() => {
    load().catch(err => setError(err instanceof Error ? err.message : "Unable to load requests."))
      .finally(() => setLoading(false));
  }, [load]);
  const kinds = useMemo(() => [...new Set(requests.map(request => request.kind))].sort(), [requests]);
  const visible = useMemo(() => requests.filter(request => {
    const matchText = `${request.kind} ${request.customerId} ${Object.values(request.payload || {}).map(formatValue).join(" ")}`.toLowerCase();
    return (kind === "all" || request.kind === kind)
      && (status === "all" || request.status === status)
      && matchText.includes(search.toLowerCase());
  }), [requests, kind, status, search]);

  async function updateStatus(id: string, nextStatus: string) {
    if (!nextStatus) return;
    const token = storage.getAccessToken();
    if (!token) return setError("Admin session expired. Please sign in again.");
    setBusy(id);
    setError("");
    try {
      await fetchOrdersApi(`/orders/expansions/${id}/status`, {
        method: "PATCH", token, body: JSON.stringify({ status: nextStatus }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request update failed");
    } finally {
      setBusy("");
    }
  }

  return <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Additional service requests</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review emergency jobs, quotations, appliance/property records, support, inspections and contracts.
        </p>
      </div>
      <button type="button" onClick={() => {
        setLoading(true);
        load().then(() => setError("")).catch(err => setError(err instanceof Error ? err.message : "Refresh failed"))
          .finally(() => setLoading(false));
      }} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium" disabled={loading}>
        Refresh requests
      </button>
    </header>
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <input aria-label="Search requests" placeholder="Search customer, service or details" value={search}
        onChange={event => setSearch(event.target.value)}
        className="min-w-48 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
      <select aria-label="Filter request type" value={kind} onChange={event => setKind(event.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
        <option value="all">All types</option>
        {kinds.map(value => <option key={value} value={value}>{value}</option>)}
      </select>
      <select aria-label="Filter request status" value={status} onChange={event => setStatus(event.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
        <option value="all">All statuses</option>
        {Object.keys(transitions).map(value => <option key={value} value={value}>{value}</option>)}
      </select>
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-700">
          <tr>{["Type / Details", "Customer", "Status", "Received", "Admin action"].map(label =>
            <th className="p-4" key={label}>{label}</th>)}</tr>
        </thead>
        <tbody>
          {visible.map(request => <tr key={request.id} className="border-t align-top">
            <td className="min-w-72 p-4">
              <strong className="text-gray-900">{request.kind}</strong>
              <p className="mt-1 font-medium">{String(request.payload?.subject || request.payload?.service || "Service request")}</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium text-teal-800">View full request & offers</summary>
                <dl className="mt-3 space-y-2">
                  {Object.entries(request.payload || {}).map(([key, value]) =>
                    <div key={key} className="rounded-lg bg-gray-50 p-2">
                      <dt className="text-xs font-semibold uppercase text-gray-500">{key}</dt>
                      <dd className="break-words text-gray-800">{formatValue(value)}</dd>
                    </div>)}
                  {request.assignedTechnicianId && <div>
                    <dt className="text-xs font-semibold text-gray-500">Assigned technician</dt>
                    <dd className="break-all">{request.assignedTechnicianId}</dd>
                  </div>}
                </dl>
                {request.offers?.length ? <div className="mt-3 space-y-2 border-t pt-3">
                  <p className="font-semibold">Technician quotations ({request.offers.length})</p>
                  {request.offers.map(offer => <p key={offer.id} className="rounded-lg bg-gray-50 p-2">
                    ৳{Number(offer.amount).toLocaleString()} · {offer.status}
                    {offer.scope ? ` · ${offer.scope}` : ""}
                  </p>)}
                </div> : <p className="mt-3 text-xs text-gray-500">No quotation offers yet.</p>}
              </details>
            </td>
            <td className="max-w-40 break-all p-4 text-xs text-gray-600">{request.customerId}</td>
            <td className="p-4 font-medium">{request.status}</td>
            <td className="whitespace-nowrap p-4 text-gray-600">{new Date(request.createdAt).toLocaleDateString()}</td>
            <td className="p-4">
              <select aria-label={`Update request ${request.id}`}
                disabled={busy === request.id || !transitions[request.status]?.length}
                value="" onChange={event => void updateStatus(request.id, event.target.value)}
                className="rounded-lg border border-gray-200 p-2 text-sm">
                <option value="">{busy === request.id ? "Saving..." : "Change status"}</option>
                {(transitions[request.status] || []).map(next => <option key={next} value={next}>{next}</option>)}
              </select>
            </td>
          </tr>)}
        </tbody>
      </table>
      {!loading && !visible.length && <p className="p-8 text-center text-gray-500">No matching service requests.</p>}
      {loading && <p className="p-8 text-center text-gray-500">Loading requests...</p>}
    </div>
    <p className="text-xs text-gray-500">All changes use authenticated admin APIs. Quotation selection and assignment follow the relevant backend workflow; status changes alone do not dispatch technicians or collect payments.</p>
  </div>;
}
