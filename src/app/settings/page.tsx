"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/store/settings.store";
import { usePlayerStore }   from "@/store/player.store";
import {
  Key, Copy, Check, Trash2, Plus, ChevronDown, LogIn, LogOut, User as UserIcon,
  Activity, Wifi, Zap, Shield, HelpCircle, Eye, EyeOff, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { LoginModal } from "@/components/Auth/LoginModal";
import { createClient } from "@/lib/supabase/client";
import { usePlaylistStore }   from "@/store/playlist.store";
import { useQuotaStore, DAILY_QUOTA_LIMIT } from "@/store/quota.store";

/* ─── Types ──────────────────────────────────────────────────────────── */

type ManagedKey = {
  id: string; label: string; masked: string; createdAt: string;
  status: "active" | "quota";
};
type Env = "Production" | "Development" | "Staging";

/* ─── Quality options ─────────────────────────────────────────────────── */

const QUALITY_OPTS = [
  {
    id: "auto",   title: "Auto (Recommended)",
    desc: "Adapts dynamically to your network. Video: best available resolution.",
    iconName: "activity",
  },
  {
    id: "small",  title: "Data Saver",
    desc: "144p or 240p stream — lowest data usage. Best for weak or metered networks.",
    iconName: "wifi-low",
  },
  {
    id: "medium", title: "Standard",
    desc: "360p stream — sweet spot. Thumbnails use standard (640×480) res.",
    iconName: "wifi",
  },
  {
    id: "hd720",  title: "High Quality (HD)",
    desc: "Targets 1080p (falls back to lowest available ≥ 360p). Best on Wi-Fi.",
    iconName: "zap",
  },
];

function QualityIcon({ name }: { name: string }) {
  if (name === "activity") return <Activity className="w-5 h-5" style={{ color: 'var(--primary)' }} />;
  if (name === "wifi-low") return <Wifi     className="w-5 h-5" style={{ color: '#f87171' }} />;
  if (name === "wifi")     return <Wifi     className="w-5 h-5" style={{ color: '#4ade80' }} />;
  return                          <Zap      className="w-5 h-5" style={{ color: 'var(--tertiary)' }} />;
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function mask(k: string) {
  if (!k || k.length < 8) return "•".repeat(10);
  return k.slice(0, 6) + "••••••" + k.slice(-4).toUpperCase();
}

/* ═══════════════════════════════════════════════════════════════════════
   Settings Page
   ═══════════════════════════════════════════════════════════════════════ */

export default function SettingsPage() {
  const { apiKey, setApiKey, clearApiKey, syncApiKeyWithCloud } = useSettingsStore();
  const quality    = usePlayerStore((s) => s.quality);
  const setQuality = usePlayerStore((s) => s.setQuality);
  const { syncPlaylistsWithCloud } = usePlaylistStore();
  const todayUsed  = useQuotaStore((s) => s.todayUsed());
  const quotaEntries = useQuotaStore((s) => s.entries);

  const [user,        setUser]        = useState<any>(null);
  const [showLogin,   setShowLogin]   = useState(false);
  const supabase = createClient();

  const [inputKey,    setInputKey]    = useState(apiKey);
  const [showKey,     setShowKey]     = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [keys,        setKeys]        = useState<ManagedKey[]>([]);
  const [newLabel,    setNewLabel]    = useState("");
  const [newEnv,      setNewEnv]      = useState<Env>("Production");
  const [showEnvMenu, setShowEnvMenu] = useState(false);

  const usagePct = apiKey ? Math.min(100, Math.round((todayUsed / DAILY_QUOTA_LIMIT) * 100)) : 0;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        syncApiKeyWithCloud();
        syncPlaylistsWithCloud();
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        syncApiKeyWithCloud();
        syncPlaylistsWithCloud();
        setShowLogin(false);
      } else {
        setUser(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setInputKey(apiKey);
    if (apiKey && keys.length === 0) {
      setKeys([{ id: "main", label: "Main Playback Cluster",
                 masked: mask(apiKey), createdAt: "Active", status: "active" }]);
    }
  }, [apiKey]);

  const handleSave = () => {
    const k = inputKey.trim();
    if (!k) return;
    setIsSaving(true);
    setTimeout(() => {
      setApiKey(k);
      setSaved(true); setIsSaving(false);
      setKeys([{ id: "main", label: "Main Playback Cluster",
                 masked: mask(k), createdAt: "Just now", status: "active" }]);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  const handleCopy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* ── Section wrapper ── */
  const Section = ({ children }: { children: React.ReactNode }) => (
    <section className="rounded-2xl p-5"
             style={{ background: 'var(--surface-container)', border: '1px solid rgba(60,73,78,0.18)' }}>
      {children}
    </section>
  );

  const Label = ({ text }: { text: string }) => (
    <p className="text-[10px] font-black uppercase tracking-widest mb-3"
       style={{ color: 'var(--on-surface-variant)' }}>{text}</p>
  );

  return (
    <main className="min-h-screen pb-36" style={{ background: 'var(--background)' }}>

      {/* Page header */}
      <div className="px-4 pt-2 pb-6">
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--on-surface)' }}>
          Settings
        </h1>
        <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--on-surface-variant)' }}>
          Manage your account, API key, and playback quality.
        </p>
      </div>

      <div className="px-4 space-y-8 flex flex-col">
        {/* Auth Section */}
        <section className="rounded-2xl p-5 relative overflow-hidden group"
                 style={{ background: 'var(--surface-container)', border: '1px solid rgba(60,73,78,0.18)' }}>
           
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
           <p className="text-[10px] font-black uppercase tracking-widest mb-4 relative z-10"
              style={{ color: 'var(--on-surface-variant)' }}>Account & Syncing</p>

           {user ? (
             <div className="flex flex-col gap-4 relative z-10">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                   <img src={user.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} 
                        alt="Avatar" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="font-bold text-sm truncate" style={{ color: 'var(--on-surface)' }}>
                     {user.user_metadata?.full_name || user.email}
                   </p>
                   <p className="text-xs truncate flex items-center gap-1 mt-0.5" style={{ color: 'var(--on-surface-variant)' }}>
                     <CheckCircle2 className="w-3 h-3 text-primary" /> Synced to Cloud
                   </p>
                 </div>
               </div>
               <button onClick={() => supabase.auth.signOut()}
                       className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
                       style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
                 Sign Out
               </button>
             </div>
           ) : (
             <div className="flex flex-col gap-4 relative z-10">
               <p className="text-sm leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                 Sign in to sync your Playlists and securely back up your API keys across all your devices using End-to-End cyphertext encryption.
               </p>
               <button onClick={() => setShowLogin(true)}
                       className="w-full py-3 rounded-xl text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(0,252,67,0.15)]"
                       style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
                 <LogIn className="w-4 h-4" />
                 Sign In / Register
               </button>
             </div>
           )}
        </section>

        {/* API Key Management */}
        <Section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(0,252,67,0.1)' }}>
              <Key className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            </div>
            <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--on-surface)' }}>
              API Key Config
            </h2>
          </div>
          <p className="text-xs leading-relaxed mb-6" style={{ color: 'var(--on-surface-variant)' }}>
            Your key is {user ? "encrypted heavily before being saved to the cloud" : "stored entirely locally. Sign in to seamlessly sync it and your playlists"}.
          </p>
          <Label text="Active API Key" />

          {apiKey ? (
            <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-4"
                 style={{ background: 'var(--surface-container-low)',
                          border: '1px solid rgba(60,73,78,0.2)' }}>
              <span className="font-mono text-sm tracking-wider" style={{ color: 'var(--on-surface)' }}>
                {mask(apiKey)}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={handleCopy}
                        className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                        style={{ color: copied ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={() => { clearApiKey(); setInputKey(""); setKeys([]); }}
                        className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                        style={{ color: 'var(--error)' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4"
                 style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.25)' }}>
              <Key className="w-4 h-4" style={{ color: 'var(--error)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--error)' }}>
                No API key — search &amp; playback disabled
              </span>
            </div>
          )}

          {/* Input */}
          <div className="relative mb-3">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                 style={{ color: 'var(--on-surface-variant)' }} />
            <input
              type={showKey ? "text" : "password"}
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
              placeholder="Paste your YouTube Data API v3 key…"
              className="w-full h-12 pl-10 pr-10 text-sm rounded-xl outline-none transition-all"
              style={{
                background: 'var(--surface-container-low)',
                color: 'var(--on-surface)',
                border: '1px solid rgba(60,73,78,0.25)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,252,67,0.4)'; }}
              onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(60,73,78,0.25)'; }}
            />
            <button onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5"
                    style={{ color: 'var(--on-surface-variant)' }}>
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!inputKey.trim() || isSaving}
              className="h-10 px-5 text-sm font-black rounded-xl disabled:opacity-40 transition-all active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
                color: 'var(--on-primary)',
                boxShadow: inputKey.trim() ? '0 0 18px rgba(0,252,67,0.25)' : 'none',
              }}
            >
              {isSaving ? "Saving…" : saved ? "✓ Saved" : "Save Key"}
            </button>
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank" rel="noopener noreferrer"
              className="text-xs font-bold hover:opacity-80 transition-opacity"
              style={{ color: 'var(--primary)' }}
            >
              Get a key ↗
            </a>
          </div>
        </Section>

        {/* ── Managed Keys ─────────────────────────────────────────────── */}
        <Section>
          <Label text="Manage Multiple Keys" />
          {keys.length === 0 ? (
            <p className="text-xs italic py-4 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
              No saved keys. Enter and save a key above.
            </p>
          ) : (
            <div className="space-y-2">
              {keys.map((k) => (
                <div key={k.id} className="flex items-center gap-3 p-3 rounded-xl"
                     style={{
                       background: 'var(--surface-container-low)',
                       border: `1px solid ${k.status === "active" ? "rgba(60,73,78,0.2)" : "rgba(255,59,48,0.25)"}`,
                     }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                       style={{ background: 'var(--surface-container-high)' }}>
                    <Key className="w-4 h-4" style={{ color: 'var(--on-surface-variant)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--on-surface)' }}>{k.label}</p>
                    <p className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>{k.createdAt}</p>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                        style={{
                          background: k.status === "active" ? 'rgba(0,252,67,0.15)' : 'rgba(255,59,48,0.15)',
                          color:      k.status === "active" ? 'var(--primary)'       : 'var(--error)',
                        }}>
                    {k.status === "active" ? "Active" : "Quota"}
                  </span>
                  <button onClick={() => { setKeys(p => p.filter(x => x.id !== k.id)); if (k.id === "main") { clearApiKey(); setInputKey(""); } }}
                          className="p-1.5 rounded-lg transition-colors shrink-0"
                          style={{ color: 'var(--on-surface-variant)' }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Provision ────────────────────────────────────────────────── */}
        <Section>
          <Label text="Provision New Key" />
          <div className="space-y-3">
            <input
              type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)}
              placeholder="Key label, e.g. Mobile App Dev"
              className="w-full h-11 px-4 text-sm rounded-xl outline-none transition-all"
              style={{ background: 'var(--surface-container-low)', color: 'var(--on-surface)',
                       border: '1px solid rgba(60,73,78,0.25)' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,252,67,0.35)'; }}
              onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(60,73,78,0.25)'; }}
            />
            <div className="relative">
              <button
                onClick={() => setShowEnvMenu(!showEnvMenu)}
                className="w-full h-11 px-4 text-sm flex items-center justify-between rounded-xl transition-colors"
                style={{ background: 'var(--surface-container-low)', color: 'var(--on-surface)',
                         border: '1px solid rgba(60,73,78,0.25)' }}
              >
                <span>{newEnv}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showEnvMenu ? "rotate-180" : ""}`}
                             style={{ color: 'var(--on-surface-variant)' }} />
              </button>
              {showEnvMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10"
                     style={{ background: 'var(--surface-container-high)',
                              border: '1px solid rgba(60,73,78,0.25)',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.7)' }}>
                  {(["Production","Development","Staging"] as Env[]).map(env => (
                    <button key={env} onClick={() => { setNewEnv(env); setShowEnvMenu(false); }}
                            className="w-full px-4 py-3 text-sm text-left transition-colors hover:brightness-110"
                            style={{ color: newEnv === env ? 'var(--primary)' : 'var(--on-surface)',
                                     fontWeight: newEnv === env ? 700 : 400 }}>
                      {env}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (!newLabel.trim()) { toast.error("Enter a key label."); return; }
                toast.info("Enter your key above and save it.");
                setNewLabel("");
              }}
              className="w-full h-12 text-sm font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
                color: 'var(--on-primary)',
                boxShadow: '0 0 20px rgba(0,252,67,0.2)',
              }}
            >
              <Plus className="w-4 h-4" />
              Add New Provisioning Key
            </button>
          </div>
        </Section>

        {/* ── Usage ─────────────────────────────────────────────────────── */}
        {apiKey && (
          <Section>
            <Label text="Usage Status" />
            <div className="flex items-end justify-between mb-3">
              <div>
                <span className="text-3xl font-black" style={{ color: 'var(--on-surface)' }}>{usagePct}</span>
                <span className="text-lg font-black" style={{ color: 'var(--on-surface)' }}>%</span>
                <p className="text-xs mt-0.5" style={{ color: 'var(--on-surface-variant)' }}>Daily Quota Used</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm" style={{ color: 'var(--on-surface)' }}>{todayUsed.toLocaleString()} / {DAILY_QUOTA_LIMIT.toLocaleString()}</p>
                <p className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>Units Today</p>
              </div>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden"
                 style={{ background: 'var(--surface-container-high)' }}>
              <div className="h-full rounded-full transition-all duration-1000"
                   style={{ width: `${usagePct}%`,
                            background: usagePct > 80 ? 'linear-gradient(90deg,#f87171,#ef4444)' : 'linear-gradient(90deg, var(--primary), var(--secondary))' }} />
            </div>
            {/* Breakdown */}
            {quotaEntries.length > 0 && (() => {
              const today = new Date().toISOString().slice(0, 10);
              const todayEntries = quotaEntries.filter(e => new Date(e.timestamp).toISOString().slice(0, 10) === today);
              const byOp: Record<string, number> = {};
              todayEntries.forEach(e => { byOp[e.operation] = (byOp[e.operation] || 0) + e.cost; });
              return (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {Object.entries(byOp).map(([op, cost]) => (
                    <div key={op} className="flex items-center justify-between px-3 py-2 rounded-lg"
                         style={{ background: 'var(--surface-container-low)', border: '1px solid rgba(60,73,78,0.15)' }}>
                      <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--on-surface-variant)' }}>{op}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--on-surface)' }}>{cost} u</span>
                    </div>
                  ))}
                </div>
              );
            })()}
            <div className="flex items-start gap-2 p-3 rounded-xl mt-3"
                 style={{ background: 'var(--surface-container-low)', border: '1px solid rgba(60,73,78,0.15)' }}>
              <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'rgba(0,252,67,0.4)' }} />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                <span style={{ color: 'var(--on-surface)', fontWeight: 600 }}>Pro Tip: </span>
                Your key is local to this browser session only.
              </p>
            </div>
          </Section>
        )}

        {/* ── Streaming Quality ──────────────────────────────────────────── */}
        <Section>
          <Label text="Streaming Quality" />
          <p className="text-xs mb-4" style={{ color: 'var(--on-surface-variant)' }}>
            Audio fidelity difference between 360p and 1080p is minimal. Higher = more data.
          </p>
          <div className="space-y-2">
            {QUALITY_OPTS.map((opt) => {
              const active = quality === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setQuality(opt.id as any)}
                  className="w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all"
                  style={{
                    background: active ? 'rgba(0,252,67,0.08)' : 'var(--surface-container-low)',
                    border: active ? '1px solid rgba(0,252,67,0.35)' : '1px solid rgba(60,73,78,0.15)',
                    boxShadow: active ? '0 0 14px rgba(0,252,67,0.1)' : 'none',
                  }}
                >
                  <div className="mt-0.5 shrink-0"><QualityIcon name={opt.iconName} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-sm"
                            style={{ color: active ? 'var(--primary)' : 'var(--on-surface)' }}>
                        {opt.title}
                      </span>
                      {active && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />}
                    </div>
                    <p className="text-xs leading-relaxed"
                       style={{ color: active ? 'rgba(0,252,67,0.5)' : 'var(--on-surface-variant)' }}>
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── Help ──────────────────────────────────────────────────────── */}
        <Section>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 style={{ background: 'var(--surface-container-high)' }}>
              <HelpCircle className="w-5 h-5" style={{ color: 'var(--on-surface-variant)' }} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: 'var(--on-surface)' }}>Need help?</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--on-surface-variant)' }}>
                YouTube Data API v3 beginners guide.
              </p>
            </div>
            <a href="https://developers.google.com/youtube/v3/getting-started"
               target="_blank" rel="noopener noreferrer"
               className="text-xs font-bold hover:opacity-80 transition-opacity shrink-0"
               style={{ color: 'var(--primary)' }}>
              Docs ↗
            </a>
          </div>
        </Section>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </main>
  );
}