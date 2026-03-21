"use client";

import Link from "next/link";
import { Search, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function TopBar() {
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
    <header className="sticky top-0 z-40 px-4 pt-4 pb-3 flex items-center justify-between"
      style={{ background: 'var(--background)' }}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-1 outline-none">
        <span
          className="text-xl font-black tracking-tight"
          style={{ color: 'var(--primary)', textShadow: '0 0 10px rgba(0,252,67,0.5)' }}
        >
          Sonic
        </span>
        <span className="text-lg font-black tracking-tight" style={{ color: 'var(--on-surface)' , textShadow: '0 0 20px rgba(255, 255, 255, 0.5)'}}>View</span>
      </Link>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <Link
          href="/search"
          aria-label="Search"
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
          style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)' }}
        >
          <Search className="w-4 h-4" />
        </Link>
        {/* Avatar */}
        <Link 
          href="/settings"
          className="w-8 h-8 flex items-center justify-center rounded-full transition-transform active:scale-95 overflow-hidden"
          style={{
            background: user ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--surface-container-high)',
            color: user ? 'var(--on-primary)' : 'var(--on-surface-variant)',
            boxShadow: user ? '0 0 10px rgba(0,252,67,0.3)' : 'none'
          }}
        >
          {user ? (
            <span className="text-xs font-black uppercase">
              {user.email?.charAt(0) || 'S'}
            </span>
          ) : (
            <UserIcon className="w-4 h-4" />
          )}
        </Link>
      </div>
    </header>
  );
}
