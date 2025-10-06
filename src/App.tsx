import React, { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { Gallery, ReportForm } from "./Public";
import { AdminDashboard } from "./Admin";

/** ===== Tipe data diekspor agar bisa dipakai di file lain ===== */
export type Item = {
  id: string;
  title: string;
  location: string;
  date: string;
  image: string | null;
  status: "available" | "claimed";
};

export type ReportQueue = {
  id: string;
  title: string;
  location: string;
  date: string;
  image: string | null;
};

export type ReportPayload = {
  title: string;
  description: string;
  location: string;
  date: string;
  contact: string;
  file?: File;
};

export type Claim = {
  id: string;
  itemId: string;
  name: string;
  contact: string;
  note?: string;
  date: string;
  status: "pending" | "accepted" | "rejected";
};

/** ===== Data awal ===== */
const initialItems: Item[] = [
  { id: "itm-ktm", title: "KTM", location: "Perpustakaan Pusat", date: "2025-09-14", image: null, status: "available" },
  { id: "itm-kunci", title: "Kunci", location: "Kantin FTI", date: "2025-09-16", image: null, status: "available" },
  { id: "itm-tumbler", title: "Tumbler", location: "Ruang Kelas A-203", date: "2025-09-18", image: null, status: "available" },
];
const initialQueue: ReportQueue[] = [
  { id: "rep-1", title: "Jaket Hitam", location: "Depan Ruang Rapat Fakultas", date: "2025-09-19", image: null },
  { id: "rep-2", title: "Payung Bening", location: "Halte Kampus Timur", date: "2025-09-19", image: null },
  { id: "rep-3", title: "Kalkulator Casio", location: "Laboratorium Komputer", date: "2025-09-20", image: null },
];
const initialClaims: Claim[] = [];

/** ===== Util penyimpanan lokal ===== */
function saveState(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {
    // Ignore write errors
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

/** ===== UI kecil ===== */
function NavLink({ active, children, onClick }:
  { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${active ? "bg-white text-slate-900 shadow" : "text-slate-200 hover:text-white hover:bg-white/10"}`}
    >
      {children}
    </button>
  );
}
function LoginScreen({ onLogin }:{ onLogin:(role:"user"|"admin")=>void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg text-center">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Temu Balik Kampus</h1>
        <p className="mb-6 text-sm text-slate-500">Pilih jenis pengguna untuk masuk</p>
        <div className="flex flex-col gap-3">
          <button onClick={() => onLogin("user")} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Masuk sebagai Pengguna</button>
          <button onClick={() => onLogin("admin")} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Masuk sebagai Admin</button>
        </div>
      </div>
    </div>
  );
}

/** ===== App ===== */
export default function App() {
  type View = "login" | "home" | "report" | "admin";
  const [view, setView] = useState<View>("login");
  const [currentUser, setCurrentUser] = useState<"user" | "admin" | null>(null);

  const [items, setItems] = useState<Item[]>(() => loadState("tbk_items", initialItems));
  const [queue, setQueue] = useState<ReportQueue[]>(() => loadState("tbk_queue", initialQueue));
  const [claims, setClaims] = useState<Claim[]>(() => loadState("tbk_claims", initialClaims));
  useEffect(() => { saveState("tbk_items", items); }, [items]);
  useEffect(() => { saveState("tbk_queue", queue); }, [queue]);
  useEffect(() => { saveState("tbk_claims", claims); }, [claims]);

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
      { id: `itm-${Date.now()}`, title: rep.title, location: rep.location, date: rep.date, image: rep.image ?? null, status: "available" },
      ...prev,
    ]);
  }
  function reject(id: string) {
    setQueue((q) => q.filter((r) => r.id !== id));
  }

  function handleExport() {
    const data = { items, queue, claims };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "temu-balik-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  function handleImport(file: File) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const data = JSON.parse(String(fr.result));
        if (Array.isArray(data.items) && Array.isArray(data.queue)) {
          setItems(data.items);
          setQueue(data.queue);
          setClaims(Array.isArray(data.claims) ? data.claims : []);
          alert("Data berhasil diimpor.");
        } else {
          alert("Format data tidak valid.");
        }
      } catch {
        alert("Gagal membaca file JSON.");
      }
    };
    fr.readAsText(file);
  }
  function handleReset() {
    if (!confirm("Yakin mereset semua data")) return;
    setItems(initialItems);
    setQueue(initialQueue);
    setClaims(initialClaims);
    localStorage.removeItem("tbk_items");
    localStorage.removeItem("tbk_queue");
    localStorage.removeItem("tbk_claims");
    alert("Data telah direset.");
  }

  function acceptClaim(claimId: string) {
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return;
    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: "accepted" } : c));
    setItems(prev => prev.map(it => it.id === claim.itemId ? { ...it, status: "claimed" } : it));
    alert("Klaim diterima. Item ditandai sudah diambil.");
  }
  function rejectClaim(claimId: string) {
    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: "rejected" } : c));
    alert("Klaim ditolak.");
  }

  if (!currentUser || view === "login") return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-100 to-slate-200">
      <header className="sticky top-0 z-20 border-b border-white/30 bg-slate-900/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 text-slate-100">
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-tight">Temu Balik Kampus</div>
            <div className="text-[11px] text-slate-300">{currentUser === "admin" ? "Admin Portal" : "Lost & Found UNHAS"}</div>
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
          <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15">
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </header>

      {currentUser === "user" && view === "home" && (
        <Gallery
          items={items}
          onClickReport={() => setView("report")}
          onClaim={(itemId) => {
            const name = prompt("Nama lengkap");
            if (!name) return;
            const contact = prompt("Kontak. email atau WA");
            if (!contact) return;
            const note = prompt("Catatan singkat. opsional") || "";
            setClaims(prev => [
              { id: `clm-${Date.now()}`, itemId, name, contact, note, date: new Date().toISOString(), status: "pending" },
              ...prev
            ]);
            alert("Klaim dikirim. menunggu verifikasi admin.");
          }}
        />
      )}
      {currentUser === "user" && view === "report" && (
        <ReportForm onBack={() => setView("home")} onSubmitted={handleSubmitted} />
      )}
      {currentUser === "admin" && view === "admin" && (
        <AdminDashboard
          queue={queue}
          onApprove={approve}
          onReject={reject}
          items={items}
          onExport={handleExport}
          onImport={handleImport}
          onReset={handleReset}
          claims={claims}
          onAcceptClaim={acceptClaim}
          onRejectClaim={rejectClaim}
        />
      )}

      <footer className="border-t border-white/50 bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <p><span className="font-semibold text-slate-700">{currentUser}</span> • Prototype v0.4</p>
            <p>© {new Date().getFullYear()} Temu Balik Kampus</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
