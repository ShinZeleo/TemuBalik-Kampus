// src/Public.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  PlusCircle, Search, Upload, MapPin, CalendarDays,
  Image as ImageIcon, ShieldCheck, X as XIcon
} from "lucide-react";
import type { Item, ReportPayload } from "./App";

/* UI kecil */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}
function PlaceholderImage() {
  return (
    <div className="flex h-40 w-full items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
      <ImageIcon className="h-8 w-8 text-slate-400" />
    </div>
  );
}

/* Modal Detail Item */
function ItemModal({
  item, onClose, onClaim
}: {
  item: Item;
  onClose: () => void;
  onClaim?: (itemId: string) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h3 className="text-lg font-bold text-slate-900">Detail Barang</h3>
          <button
            aria-label="Tutup"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Konten */}
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200">
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="h-72 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="h-72">
                <PlaceholderImage />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <div className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                Nama Barang
              </div>
              <div className="text-xl font-semibold text-slate-900">
                {item.title}
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{item.location}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <CalendarDays className="h-4 w-4" />
              <span className="text-sm">
                {new Date(item.date).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-1">
              <div className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                Status
              </div>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  item.status === "claimed"
                    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                    : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                }`}
              >
                {item.status === "claimed" ? "Sudah diambil" : "Tersedia"}
              </span>
            </div>

            {/* di dalam <ItemModal> kolom kanan, setelah Status */}
            {item.description && (
              <div className="mt-2">
                <div className="mb-1 text-xs uppercase tracking-wider text-slate-500">Deskripsi</div>
                <p className="text-sm leading-relaxed text-slate-700">{item.description}</p>
              </div>
            )}
            {item.contact && (
              <div className="mt-2">
                <div className="mb-1 text-xs uppercase tracking-wider text-slate-500">Kontak Penemu</div>
                <p className="text-sm text-slate-700">{item.contact}</p>
              </div>
            )}

            {onClaim && item.status !== "claimed" && (
              <button
                aria-label="Klaim barang ini"
                onClick={() => onClaim(item.id)}
                className="mt-3 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Klaim Barang Ini
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Kartu. Hanya pemicu untuk buka modal */
function Card({
  item, onOpen
}: {
  item: Item;
  onOpen: (item: Item) => void;
}) {
  return (
    <button
      onClick={() => onOpen(item)}
      className="group block w-full rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {item.image ? (
        <img
          src={item.image}
          alt={item.title}
          className="h-40 w-full rounded-t-2xl object-cover"
        />
      ) : (
        <PlaceholderImage />
      )}
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            {item.title}
          </h3>
          <Badge>Terbaru</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4" />
          <span>{item.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarDays className="h-4 w-4" />
          <span>{new Date(item.date).toLocaleDateString()}</span>
        </div>
      </div>
    </button>
  );
}

/* Galeri Publik */
export function Gallery({
  items, onClickReport, onClaim
}: {
  items: Item[];
  onClickReport: () => void;
  onClaim?: (itemId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Item | null>(null);

  const visible = useMemo(
    () => items.filter((it) => it.status !== "claimed"),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter((it) =>
      [it.title, it.location, it.date].some((f) =>
        f.toLowerCase().includes(q)
      )
    );
  }, [visible, query]);

  // urutkan terbaru
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date)),
    [filtered]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-inset ring-white/40 backdrop-blur">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Temukan Kembali Barangmu
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Pusat informasi barang hilang dan ditemukan di sekitar kampus.
            </p>
          </div>
          <button
            onClick={onClickReport}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          >
            <PlusCircle className="h-4 w-4" /> Saya Menemukan Barang
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama barang, lokasi, atau tanggal..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2"
          />
        </div>

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Barang Ditemukan Terbaru
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((it) => (
            <Card key={it.id} item={it} onOpen={(i) => setSelected(i)} />
          ))}

          {!sorted.length && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              Tidak ada hasil untuk{" "}
              <span className="font-semibold">"{query}"</span>.
            </div>
          )}
        </div>
      </div>

      {selected && (
        <ItemModal
          item={selected}
          onClose={() => setSelected(null)}
          onClaim={onClaim}
        />
      )}
    </div>
  );
}

/* Form Laporan Publik */
export function ReportForm({
  onBack, onSubmitted
}: {
  onBack: () => void;
  onSubmitted: (payload: ReportPayload) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    contact: "",
    file: undefined as File | undefined,
  });
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("File harus berupa gambar.");
      return;
    }
    if (f.size > 3 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 3MB untuk demo ini.");
      return;
    }
    setForm((s) => ({ ...s, file: f }));
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim() || !form.date) {
      alert("Nama barang, lokasi, dan tanggal wajib diisi.");
      return;
    }
    if (form.title.trim().length < 3) {
      alert("Nama barang minimal 3 karakter.");
      return;
    }
    if (form.location.trim().length < 3) {
      alert("Lokasi minimal 3 karakter.");
      return;
    }
    onSubmitted(form);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="rounded-3xl bg-white/90 p-6 shadow-sm ring-1 ring-inset ring-white/40 backdrop-blur">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-slate-900">
          Laporkan Barang yang Anda Temukan
        </h1>
        <form onSubmit={submit} className="grid grid-cols-1 gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Foto Barang
            </label>
            <div className="flex items-center gap-4">
              <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-6 text-slate-500 hover:bg-slate-50">
                <Upload className="h-6 w-6" />
                <span className="text-sm">Upload Foto Barang</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="hidden"
                />
              </label>
              <div className="w-40">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-28 w-full rounded-xl object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="h-28">
                    <PlaceholderImage />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nama Barang
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh. Kartu Identitas Mahasiswa"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Lokasi Ditemukan
              </label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Mis. Gedung Rektorat Lantai 2"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Tanggal Ditemukan
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Kontak Pelapor, opsional
              </label>
              <input
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="Email atau No. HP"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Deskripsi atau Detail, opsional
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
              placeholder="Ciri unik dan keterangan tambahan."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Kembali
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700"
            >
              <ShieldCheck className="h-4 w-4" /> SUBMIT LAPORAN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
