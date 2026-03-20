import { MusicFeed } from "@/components/Feed/MusicFeed";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';

  return (
    <main className="min-h-screen pb-32">
      <section className="max-w-7xl mx-auto py-8">
        <div className="px-4 mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {q ? `Search Results for "${q}"` : "Search Music"}
          </h2>
        </div>
        {q ? (
          <MusicFeed query={q} />
        ) : (
          <p className="px-4 text-zinc-400">Please enter a search query.</p>
        )}
      </section>
    </main>
  );
}
