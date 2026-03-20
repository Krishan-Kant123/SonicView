"use client";

import { Music, Search, Library, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/Search/SearchBar";
import Link from "next/link";
import { useState } from "react";
import { QualitySettingsModal } from "@/components/Player/QualitySettingsModal";

export function Header() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 pt-8 md:pt-12 pb-4 md:pb-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-row items-center gap-3 sm:gap-6 justify-between">
          
          {/* Logo (Icon only on extremely small screens, full logo on sm+) */}
          <Link href="/" className="flex items-center gap-3 shrink-0 mr-1 sm:mr-0 outline-none focus:ring-2 focus:ring-purple-500/50 rounded-xl">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-purple-500/20">
              <Music className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="hidden sm:block text-2xl font-bold tracking-tight text-white">Sonic<span className="text-purple-400">View</span></h1>
          </Link>
          
          {/* Unified Tool Row (Search + Actions) */}
          <div className="flex-1 flex flex-row items-center justify-end gap-2 sm:gap-4 max-w-full md:max-w-2xl">
            
            <div className="flex-1 min-w-[120px] max-w-full">
              <SearchBar />
            </div>
            
            <button 
               onClick={() => setShowSettings(true)}
               className="flex items-center justify-center p-2.5 sm:p-3 sm:px-5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold transition-colors shadow-inner shadow-black/20 group outline-none focus:ring-2 ring-purple-500/50 shrink-0"
               title="Streaming Quality & Settings"
            >
               <Settings2 className="w-5 h-5 text-purple-400 group-hover:rotate-90 transition-transform" />
               <span className="hidden md:ml-2 md:inline">Quality</span>
            </button>
            
            <Link 
               href="/playlists" 
               className="flex items-center justify-center p-2.5 sm:p-3 sm:px-5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold transition-colors shadow-inner shadow-black/20 shrink-0 outline-none focus:ring-2 ring-purple-500/50"
               title="My Library"
            >
              <Library className="w-5 h-5 text-purple-400" />
              <span className="hidden md:ml-2 md:inline">Library</span>
            </Link>

          </div>
        </div>
      </header>
    {showSettings && <QualitySettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
