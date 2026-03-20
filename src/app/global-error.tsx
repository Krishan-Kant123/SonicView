"use client";
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global Layout Crash:", error);
    toast.error("Critical Layout Crash detected. Attempting hard refresh.");
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#121212] min-h-screen flex items-center justify-center flex-col text-white font-sans p-4">
        <h1 className="text-5xl font-black mb-4">Fatal Crash</h1>
        <p className="text-zinc-500 mb-8 text-center max-w-sm">The outermost layout encountered a terminal issue preventing boot. Click the button below to re-mount.</p>
        <button 
           onClick={() => reset()} 
           className="px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
        >
           Force Hard Reload
        </button>
      </body>
    </html>
  );
}
