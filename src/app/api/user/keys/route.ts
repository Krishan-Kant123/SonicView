import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encrypt, decrypt } from '@/lib/encryption';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { apiKey } = await req.json();
    if (!apiKey) return NextResponse.json({ error: 'Missing API key' }, { status: 400 });

    const encryptedKey = encrypt(apiKey);

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, encrypted_api_key: encryptedKey });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('encrypted_api_key')
      .eq('id', user.id)
      .single();

    if (error || !data?.encrypted_api_key) {
      return NextResponse.json({ apiKey: null });
    }

    // Decrypt it for the client to store securely in local storage
    const plainTextKey = decrypt(data.encrypted_api_key);
    return NextResponse.json({ apiKey: plainTextKey });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
