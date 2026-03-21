"use client";

import { Music, Library, Settings2, User as UserIcon } from "lucide-react";
import { SearchBar } from "@/components/Search/SearchBar";
import Link from "next/link";
import { useSettingsStore } from "@/store/settings.store";
import { Key, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const hasApiKey = !!apiKey;
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-outline pt-8 md:pt-12 pb-4 md:pb-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-row items-center gap-3 sm:gap-6 justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 mr-1 sm:mr-0 outline-none focus:ring-2 focus:ring-primary/50 rounded-xl">
          <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-xl shadow-lg shadow-primary/20">
            <Music className="w-5 h-5 sm:w-8 sm:h-8 text-background" />
          </div>
          <h1 className="hidden sm:block text-2xl font-black tracking-tight text-on-surface">
            Sonic<span className="text-primary text-glow-cyan">View</span>
          </h1>
        </Link>
        
        {/* Unified Tool Row */}
        <div className="flex-1 flex flex-row items-center justify-end gap-2 sm:gap-4 max-w-full md:max-w-2xl">
          
          <div className="flex-1 min-w-[120px] max-w-full">
            <SearchBar />
          </div>
          
          {/* API Key Status Indicator */}
          <div 
            className={`flex items-center justify-center p-2.5 sm:px-4 rounded-full border transition-all shrink-0 ${
              hasApiKey 
                ? 'bg-secondary/10 border-secondary/30 text-secondary' 
                : 'bg-error/10 border-error/30 text-error'
            }`}
            title={hasApiKey ? "API Key Configured" : "API Key Not Set"}
          >
            {hasApiKey ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Key className="w-5 h-5" />
            )}
            <span className="hidden md:ml-2 md:inline text-xs font-bold uppercase tracking-wider">API</span>
          </div>
          
          <Link 
            href="/settings" 
            className="flex items-center justify-center p-2.5 sm:p-3 sm:px-5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold transition-colors shadow-inner shadow-black/20 group outline-none focus:ring-2 ring-primary/50 shrink-0 gap-2"
            title={user ? "Account & Settings" : "Settings"}
          >
            {user ? (
               <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center shrink-0" 
                    style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
                 <span className="text-xs font-black uppercase">
                   {user.email?.charAt(0) || 'S'}
                 </span>
               </div>
            ) : (
               <Settings2 className="w-5 h-5 text-primary group-hover:rotate-90 transition-transform" />
            )}
            <span className="hidden md:block max-w-[120px] truncate" style={{ color: user ? 'var(--on-surface)' : 'inherit' }}>
              {user ? (user.user_metadata?.full_name || user.email?.split('@')[0]) : "Settings"}
            </span>
          </Link>
          
          <Link 
            href="/playlists" 
            className="flex items-center justify-center p-2.5 sm:p-3 sm:px-5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold transition-colors shadow-inner shadow-black/20 shrink-0 outline-none focus:ring-2 ring-primary/50"
            title="My Library"
          >
            <Library className="w-5 h-5 text-primary" />
            <span className="hidden md:ml-2 md:inline">Library</span>
          </Link>

        </div>
      </div>
    </header>
  );
}
