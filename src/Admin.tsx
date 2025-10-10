import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { ReportQueue, Item, Claim } from "./App";

export function AdminDashboard({
  queue, onApprove, onReject, items, onExport, onImport, onReset, claims, onAcceptClaim, onRejectClaim
}: {
  queue: ReportQueue[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  items: Item[];
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  claims: Claim[];
  onAcceptClaim: (claimId: string) => void;
  onRejectClaim: (claimId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return queue;
    return queue.filter((r) => [r.title, r.location, r.date].some((f) => f.toLowerCase().includes(q)));
  }, [queue, query]);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((it) => map.set(it.date, (map.get(it.date) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count }));
  }, [items]);

  const totalAvailable = useMemo(() => items.filter(i => i.status === "available").length, [items]);
  const totalClaimed   = useMemo(() => items.filter(i => i.status === "claimed").length, [items]);


  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-3xl bg-white/90 p-6 shadow-sm ring-1 ring-inset ring-white/40 backdrop-blur">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Dasbor Admin</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={onExport} className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900">Ekspor JSON</button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-600 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">
              Impor JSON
              <input type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onImport(f); }} />
            </label>
            <button onClick={onReset} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700">Reset Data</button>
            <button
  onClick={() => {
    localStorage.removeItem("tbk_admin_login");
    location.reload();
  }}
  className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
>
  Logout
</button>

          </div>
        </div>

        <div className="relative w-full md:w-80 mb-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama barang..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2" />
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-600">Ringkasan Publikasi per Tanggal</h2>
          <div className="mb-2 mt-4 flex justify-center  gap-3 text-sm text-slate-600">
            <span>Available. <b>{totalAvailable}</b></span>
            <span>Sudah diambil. <b>{totalClaimed}</b></span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" >
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-700">Klaim Pending</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {claims.filter(c => c.status === "pending").map(c => {
              const item = items.find(it => it.id === c.itemId);
              return (
                <div key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900">{item?.title ?? "Item"}</div>
                    <div className="text-xs text-slate-600">{c.name} • {c.contact} • {new Date(c.date).toLocaleString()}</div>
                    {c.note && <div className="text-xs text-slate-600">Catatan. {c.note}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { if (confirm("Terima klaim ini")) onAcceptClaim(c.id); }} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700" aria-label="Verifikasi laporan">Terima</button>
                    <button onClick={() => { if (confirm("Tolak klaim ini")) onRejectClaim(c.id); }} className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700" aria-label="Tolak laporan">Tolak</button>
                  </div>
                </div>
              );
            })}
            {claims.filter(c => c.status === "pending").length === 0 && (
              <div className="px-4 py-6 text-sm text-slate-500">Tidak ada klaim pending.</div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Nama Barang</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Lokasi</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Tanggal</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filtered.map((r, idx) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-700">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{r.title}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{r.location}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { if (confirm("Verifikasi laporan ini")) onApprove(r.id); }} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">✓ Verifikasi</button>
                      <button onClick={() => { if (confirm("Tolak laporan ini")) onReject(r.id); }} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700">✕ Tolak</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">Tidak ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-slate-500">Tips. Siapkan SOP verifikasi dan audit trail sederhana.</div>
      </div>
    </div>
  );
}
