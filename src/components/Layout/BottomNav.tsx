"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Settings2 } from "lucide-react";

const NAV = [
  { href: "/",         icon: Home,      label: "Home" },
  { href: "/search",   icon: Search,    label: "Search" },
  { href: "/playlists",icon: Library,   label: "Library" },
  { href: "/settings", icon: Settings2, label: "Settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom"
      style={{
        background: 'rgba(13,13,13,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(60,73,78,0.2)',
      }}
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 py-3 px-4 flex-1 transition-all"
              style={{ color: active ? 'var(--primary)' : 'rgba(255,255,255,0.3)' }}
            >
              <Icon
                className="w-5 h-5"
                style={{
                  filter: active ? 'drop-shadow(0 0 6px rgba(0,252,67,0.7))' : 'none',
                }}
              />
              <span
                className="text-[9px] font-black uppercase tracking-widest"
                style={{ color: active ? 'var(--primary)' : 'rgba(255,255,255,0.25)' }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
