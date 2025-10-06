import React, { useEffect, useMemo, useState } from "react";
import {
  Search, PlusCircle, LogOut, ShieldCheck,
  CheckCircle2, XCircle, Upload, MapPin, CalendarDays, Image as ImageIcon
} from "lucide-react";

/** ====== Tipe data ====== */
type Item = {
  id: string;
  title: string;
  location: string;
  date: string;         // yyyy-mm-dd
  image: string | null; // Data URL
  status: "published";
};

type ReportQueue = {
  id: string;
  title: string;
  location: string;
  date: string;         // yyyy-mm-dd
  image: string | null; // Data URL
};

type ReportPayload = {
  title: string;
  description: string;
  location: string;
  date: string;
  contact: string;
  file?: File;
};

/** ====== Data awal demo ====== */
const initialItems: Item[] = [
  { id: "itm-ktm", title: "KTM", location: "Perpustakaan Pusat", date: "2025-09-14", image: null, status: "published" },
  { id: "itm-kunci", title: "Kunci", location: "Kantin FTI", date: "2025-09-16", image: null, status: "published" },
  { id: "itm-tumbler", title: "Tumbler", location: "Ruang Kelas A-203", date: "2025-09-18", image: null, status: "published" },
];

const initialQueue: ReportQueue[] = [
  { id: "rep-1", title: "Jaket Hitam", location: "Depan Ruang Rapat Fakultas", date: "2025-09-19", image: null },
  { id: "rep-2", title: "Payung Bening", location: "Halte Kampus Timur", date: "2025-09-19", image: null },
  { id: "rep-3", title: "Kalkulator Casio", location: "Laboratorium Komputer", date: "2025-09-20", image: null },
];

/** ====== Util penyimpanan lokal ====== */
function saveState(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {
    // Ignore write errors (e.g., private mode, quota exceeded)
  }
}
function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
async function fileToDataURL(file?: File) {
  if (!file) return null;
  return new Promise<string | null>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(null);
    r.readAsDataURL(file);
  });
}

/** ====== UI kecil ====== */
function NavLink({ active, children, onClick }:
  { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
        active ? "bg-white text-slate-900 shadow" : "text-slate-200 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
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
function Card({ item }: { item: Item }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {item.image ? (
        <img src={item.image} alt={item.title} className="h-40 w-full rounded-t-2xl object-cover" />
      ) : (
        <PlaceholderImage />
      )}
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
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
    </div>
  );
}

/** ====== Gallery publik ====== */
function Gallery({ items, onClickReport }:
  { items: Item[]; onClickReport: () => void }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.title, it.location, it.date].some((f) => f.toLowerCase().includes(q))
    );
  }, [items, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-inset ring-white/40 backdrop-blur">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Temukan Kembali Barangmu</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">Pusat informasi barang hilang dan ditemukan di sekitar kampus.</p>
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

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Barang Ditemukan Terbaru</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => (<Card key={it.id} item={it} />))}
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

/** ====== Form laporan publik ====== */
function ReportForm({ onBack, onSubmitted }:
  { onBack: () => void; onSubmitted: (payload: ReportPayload) => void }) {
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
    if (!form.title || !form.location || !form.date) {
      alert("Nama barang, lokasi, dan tanggal wajib diisi.");
      return;
    }
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
                <Upload className="h-6 w-6" />
                <span className="text-sm">Upload Foto Barang</span>
                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </label>
              <div className="w-40">
                {preview ? (
                  <img src={preview} alt="Preview" className="h-28 w-full rounded-xl object-cover ring-1 ring-slate-200" />
                ) : (
                  <PlaceholderImage />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nama Barang</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh. Kartu Identitas Mahasiswa"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Lokasi Ditemukan</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Mis. Gedung Rektorat Lantai 2"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tanggal Ditemukan</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Kontak Pelapor (opsional)</label>
              <input
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="Email atau No. HP"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Deskripsi atau Detail (opsional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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

/** ====== Dasbor Admin tanpa grafik dulu ====== */
function AdminDashboard({
  queue, onApprove, onReject
}: {
  queue: ReportQueue[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return queue;
    return queue.filter((r) => [r.title, r.location, r.date].some((f) => f.toLowerCase().includes(q)));
  }, [queue, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-3xl bg-white/90 p-6 shadow-sm ring-1 ring-inset ring-white/40 backdrop-blur">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Dasbor Admin</h1>
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama barang..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2"
            />
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
                      <button
                        onClick={() => onApprove(r.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        title="Verifikasi"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Verifikasi
                      </button>
                      <button
                        onClick={() => onReject(r.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                        title="Tolak"
                      >
                        <XCircle className="h-4 w-4" /> Tolak
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">Tidak ada data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-slate-500">Tips. Siapkan SOP verifikasi dan jejak audit sederhana.</div>
      </div>
    </div>
  );
}

/** ====== Login ====== */
function LoginScreen({ onLogin }:{ onLogin:(role:"user"|"admin")=>void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg text-center">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Temu Balik Kampus</h1>
        <p className="mb-6 text-sm text-slate-500">Pilih jenis pengguna untuk masuk</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onLogin("user")}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Masuk sebagai Pengguna
          </button>
          <button
            onClick={() => onLogin("admin")}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Masuk sebagai Admin
          </button>
        </div>
      </div>
    </div>
  );
}

/** ====== App utama ====== */
export default function App() {
  type View = "login" | "home" | "report" | "admin";
  const [view, setView] = useState<View>("login");
  const [currentUser, setCurrentUser] = useState<"user" | "admin" | null>(null);

  const [items, setItems] = useState<Item[]>(() => loadState("tbk_items", initialItems));
  const [queue, setQueue] = useState<ReportQueue[]>(() => loadState("tbk_queue", initialQueue));

  useEffect(() => { saveState("tbk_items", items); }, [items]);
  useEffect(() => { saveState("tbk_queue", queue); }, [queue]);

  function handleLogin(role: "user" | "admin") {
    setCurrentUser(role);
    setView(role === "admin" ? "admin" : "home");
  }
  function handleLogout() {
    setCurrentUser(null);
    setView("login");
  }

  async function handleSubmitted(payload: ReportPayload) {
    const image = await fileToDataURL(payload.file);
    const newRep: ReportQueue = {
      id: `rep-${Date.now()}`,
      title: payload.title || "Barang Tanpa Nama",
      location: payload.location || "-",
      date: payload.date || new Date().toISOString().slice(0, 10),
      image: image ?? null,
    };
    setQueue((q) => [newRep, ...q]);
    setView("home");
    alert("Laporan masuk ke antrian verifikasi admin. Terima kasih.");
  }

  function approve(id: string) {
    const rep = queue.find((r) => r.id === id);
    if (!rep) return;
    setQueue((q) => q.filter((r) => r.id !== id));
    setItems((prev) => [
      { id: `itm-${Date.now()}`, title: rep.title, location: rep.location, date: rep.date, image: rep.image ?? null, status: "published" },
      ...prev,
    ]);
  }
  function reject(id: string) {
    setQueue((q) => q.filter((r) => r.id !== id));
  }

  if (!currentUser || view === "login") return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-100 to-slate-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-20 border-b border-white/30 bg-slate-900/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 text-slate-100">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 font-black text-white">TB</span>
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight">Temu Balik Kampus</div>
              <div className="text-[11px] text-slate-300">{currentUser === "admin" ? "Admin Portal" : "Lost & Found UNHAS"}</div>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {currentUser === "user" && (
              <>
                <NavLink active={view === "home"} onClick={() => setView("home")}>Galeri Barang</NavLink>
                <NavLink active={view === "report"} onClick={() => setView("report")}>Lapor Barang</NavLink>
              </>
            )}
            {currentUser === "admin" && (
              <NavLink active={view === "admin"} onClick={() => setView("admin")}>Dasbor Admin</NavLink>
            )}
          </nav>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </header>

      {/* Screen Content */}
      {currentUser === "user" && view === "home" && <Gallery items={items} onClickReport={() => setView("report")} />}
      {currentUser === "user" && view === "report" && <ReportForm onBack={() => setView("home")} onSubmitted={handleSubmitted} />}
      {currentUser === "admin" && view === "admin" && <AdminDashboard queue={queue} onApprove={approve} onReject={reject} />}

      {/* Footer */}
      <footer className="border-t border-white/50 bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <p><span className="font-semibold text-slate-700">{currentUser}</span> • Prototype v0.3</p>
            <p>© {new Date().getFullYear()} Temu Balik Kampus. Semua hak dilindungi seperlunya.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
