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
  description?: string;      // +
  contact?: string;          // +
};

export type ReportQueue = {
  id: string;
  title: string;
  location: string;
  date: string;
  image: string | null;
  description?: string;      // +
  contact?: string;          // +
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
// ===== Data awal dengan gambar placeholder =====
const initialItems: Item[] = [
  {
    id: "itm-ktm",
    title: "KTM",
    location: "Perpustakaan Pusat",
    date: "2025-09-14",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Student%20ID%20Card.jpg",
    status: "available",
  },
  {
    id: "itm-kunci",
    title: "Kunci",
    location: "Kantin FTI",
    date: "2025-09-16",
    image:  
      "https://upload.wikimedia.org/wikipedia/commons/8/8b/Door_key_from_lock_type_BKS_Janus_on_keyring_from_company_O%26K_%28Orenstein_%26_Koppel%29.jpg",
    status: "available",
  },
  {
    id: "itm-tumbler",
    title: "Tumbler",
    location: "Ruang Kelas PBT-203",
    date: "2025-09-18",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/02/Tumbler_Hari_Peduli_Sampah_Nasional_2025.jpg",
    status: "available",
  },
];

const initialQueue: ReportQueue[] = [
  {
    id: "rep-1",
    title: "Jaket Hitam",
    location: "Depan Ruang Rapat Fakultas",
    date: "2025-09-19",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/3d/Leather_Jacket_Worn_by_the_Welders_-_DPLA_-_8b5a11b785c01c5fcb01db0daf599a24_%28page_3%29.jpg",
  },
  {
    id: "rep-2",
    title: "Payung Bening",
    location: "Halte Kampus Timur",
    date: "2025-09-19",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/c1/Umbrellas_%284641623901%29.jpg",
  },
  {
    id: "rep-3",
    title: "Kalkulator Casio",
    location: "Laboratorium Komputer",
    date: "2025-09-20",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Casio%20FX-82%20Scientific%20Calculator%20(51878773081)%20(cropped).jpg",
  },
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

// App.tsx
async function compressToDataURL(file: File, maxWidth = 1024, quality = 0.8): Promise<string> {
    const dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = () => rej(new Error("read error"));
      r.readAsDataURL(file);
    });
    const img = document.createElement("img");
    await new Promise<void>(ok => { img.onload = () => ok(); img.src = dataUrl; });
    const scale = Math.min(1, maxWidth / img.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
}


/** ===== App ===== */
export default function App() {
  type View = "login" | "home" | "report" | "admin";
  const [view, setView] = useState<View>("login");
  const [currentUser, setCurrentUser] = useState<"user" | "admin" | null>(null);

  const [items, setItems] = useState<Item[]>(() => loadState("tbk_items", initialItems));
  const [queue, setQueue] = useState<ReportQueue[]>(() => loadState("tbk_queue", initialQueue));
  const [claims, setClaims] = useState<Claim[]>(() => loadState("tbk_claims", initialClaims));
  useEffect(() => { if (currentUser) localStorage.setItem("tbk_role", currentUser); }, [currentUser]);
  useEffect(() => { const r = localStorage.getItem("tbk_role") as "user"|"admin"|null; if (r) { setCurrentUser(r); setView(r==="admin"?"admin":"home"); } }, []);

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
    const image = payload.file ? await compressToDataURL(payload.file) : null;
    const newRep: ReportQueue = {
      id: `rep-${Date.now()}`,
      title: payload.title || "Barang Tanpa Nama",
      location: payload.location || "-",
      date: payload.date || new Date().toISOString().slice(0, 10),
      image: image ?? null,
      description: payload.description || "",   
      contact: payload.contact || ""             
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
      { id: `itm-${Date.now()}`, title: rep.title, location: rep.location, date: rep.date, image: rep.image ?? null, status: "available", description: rep.description, contact: rep.contact  },
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
          const okItems = data.items.every((it: ReportQueue) => it && typeof it.id==="string" && it.title && it.location && it.date);
          const okQueue = data.queue.every((r: ReportQueue) => r && typeof r.id==="string" && r.title && r.location && r.date);
          if (!okItems || !okQueue) { alert("Struktur JSON tidak valid."); return; }

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
    <div className="min-h-dvh grid grid-rows-[auto_1fr_auto] bg-gradient-to-br from-slate-100 via-slate-100 to-slate-200">
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
      
      
      <main className="min-h-0">
        {currentUser === "user" && view === "home" && (
          <Gallery
          items={items}
          onClickReport={() => setView("report")}
          onClaim={(itemId) => {
            const name = prompt("Nama lengkap"); if (!name) return;
            const contact = prompt("Kontak. email atau WA"); if (!contact) return;

            // Cegah klaim ganda pending untuk item yang sama dari kontak yang sama
            const hasPending = claims.some(c => c.itemId === itemId && c.contact === contact && c.status === "pending");
            if (hasPending) { alert("Klaim kamu untuk barang ini sudah tercatat dan masih menunggu verifikasi."); return; }

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
      </main>

    <footer className="border-t border-white/50 bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <p><span className="font-semibold text-slate-700">{currentUser}</span> • Prototype v0.4</p>
          <p>© {new Date().getFullYear()} Temu Balik Kampus</p>
          <p>By Imam & Yayat</p>
        </div>
      </div>
    </footer>
    </div>
  );
}
