"use client";

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (query.includes('youtube.com/') || query.includes('youtu.be/')) {
        setError('Category Not Supported. Please search by song name or artist.');
        return;
    }

    setError(null);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-purple-500 transition-colors" />
        </div>
        <input
          type="text"
          className={cn(
            "w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-3 pl-12 pr-10",
            "text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500",
            "transition-all backdrop-blur-md"
          )}
          placeholder="Search for songs, artists, or albums..."
          value={query}
          onChange={(e) => {
             setQuery(e.target.value);
             if (error) setError(null);
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </form>
      {error && <p className="text-red-400 text-sm mt-2 font-medium bg-black/50 p-2 rounded-md">{error}</p>}
    </div>
  );
}
