import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ playlists: data });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { playlists } = await req.json(); // Array of playlists from local storage
  
  if (!playlists || !Array.isArray(playlists)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  // Upsert them
  const upserts = playlists.map((pl: any) => ({
    id: pl.id,
    user_id: user.id,
    name: pl.name,
    tracks: pl.tracks,
    updated_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('playlists')
    .upsert(upserts, { onConflict: 'id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
