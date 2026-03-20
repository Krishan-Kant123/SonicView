"use client";

import { useEffect } from 'react';
import { toast } from 'sonner';
import { RefreshCcw, AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Critical Application Crash caught by Boundary:", error);
    toast.error("Application crashed unexpectedly. We're trying to recover.");
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center mt-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-red-500/10 p-6 rounded-[2rem] mb-8 border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.15)]">
         <AlertTriangle className="w-16 h-16 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
      </div>
      <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md">Oops! Something broke.</h2>
      <p className="text-zinc-400 text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed">
        We encountered a critical rendering error while loading this page. Our audio engine is protected—just click reload to reset the UI!
      </p>
      
      <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
         <button
           onClick={() => reset()}
           className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-purple-500/20 shadow-lg px-8 py-3.5 rounded-full font-bold hover:scale-105 active:scale-95 transition-all"
         >
           <RefreshCcw className="w-5 h-5" /> Reload Application
         </button>
         <Link
           href="/"
           className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#18181b] border border-white/10 hover:bg-white/10 px-8 py-3.5 rounded-full font-bold text-white transition-colors active:scale-95"
         >
           <Home className="w-5 h-5 text-zinc-400" /> Go back Home
         </Link>
      </div>
    </div>
  );
}
