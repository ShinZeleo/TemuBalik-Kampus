import React, { useMemo, useState } from "react";
import { PlusCircle, Search, Upload, MapPin, CalendarDays, Image as ImageIcon, ShieldCheck } from "lucide-react";
import type { Item, ReportPayload } from "./App";

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">{children}</span>;
}
function PlaceholderImage() {
  return (
    <div className="flex h-40 w-full items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
      <ImageIcon className="h-8 w-8 text-slate-400" />
    </div>
  );
}
function Card({ item, onClaim }: { item: Item; onClaim?: (itemId: string) => void }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {item.image ? (
        <img src={item.image} alt={item.title} className="h-40 w-full rounded-t-2xl object-cover" />
      ) : <PlaceholderImage />}
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
          <Badge>Terbaru</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="h-4 w-4" /><span>{item.location}</span></div>
        <div className="flex items-center gap-2 text-sm text-slate-600"><CalendarDays className="h-4 w-4" /><span>{new Date(item.date).toLocaleDateString()}</span></div>
        {onClaim && item.status !== "claimed" && (
          <button onClick={() => onClaim(item.id)} className="mt-2 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            Klaim Barang Ini
          </button>
        )}
      </div>
    </div>
  );
}

export function Gallery({
  items, onClickReport, onClaim
}: { items: Item[]; onClickReport: () => void; onClaim?: (itemId: string) => void }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => items.filter(it => it.status !== "claimed"), [items]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter((it) => [it.title, it.location, it.date].some((f) => f.toLowerCase().includes(q)));
  }, [visible, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-inset ring-white/40 backdrop-blur">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Temukan Kembali Barangmu</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">Pusat informasi barang hilang dan ditemukan di sekitar kampus.</p>
          </div>
          <button onClick={onClickReport} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700">
            <PlusCircle className="h-4 w-4" /> Saya Menemukan Barang
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama barang, lokasi, atau tanggal..." className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2" />
        </div>

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Barang Ditemukan Terbaru</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => (<Card key={it.id} item={it} onClaim={onClaim} />))}
          {!filtered.length && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              Tidak ada hasil untuk <span className="font-semibold">"{query}"</span>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReportForm({ onBack, onSubmitted }:{ onBack: () => void; onSubmitted: (payload: ReportPayload) => void }) {
  const [form, setForm] = useState({ title: "", description: "", location: "", date: "", contact: "", file: undefined as File | undefined });
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { alert("File harus berupa gambar."); return; }
    if (f.size > 3 * 1024 * 1024) { alert("Ukuran gambar maksimal 3MB untuk demo ini."); return; }
    setForm((s) => ({ ...s, file: f }));
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.location || !form.date) { alert("Nama barang, lokasi, dan tanggal wajib diisi."); return; }
    onSubmitted(form);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="rounded-3xl bg-white/90 p-6 shadow-sm ring-1 ring-inset ring-white/40 backdrop-blur">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-slate-900">Laporkan Barang yang Anda Temukan</h1>
        <form onSubmit={submit} className="grid grid-cols-1 gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Foto Barang</label>
            <div className="flex items-center gap-4">
              <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-6 text-slate-500 hover:bg-slate-50">
                <Upload className="h-6 w-6" /><span className="text-sm">Upload Foto Barang</span>
                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </label>
              <div className="w-40">{preview ? <img src={preview} alt="Preview" className="h-28 w-full rounded-xl object-cover ring-1 ring-slate-200" /> : <div className="h-28"><PlaceholderImage /></div>}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Nama Barang</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Contoh. Kartu Identitas Mahasiswa" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2" required />
            </div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Lokasi Ditemukan</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Mis. Gedung Rektorat Lantai 2" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2" required />
            </div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Tanggal Ditemukan</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2" required />
            </div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Kontak Pelapor (opsional)</label>
              <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Email atau No. HP" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Deskripsi atau Detail (opsional)</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Ciri unik dan keterangan tambahan." className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2" />
          </div>

          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Kembali</button>
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700">
              <ShieldCheck className="h-4 w-4" /> SUBMIT LAPORAN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
