import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const client = getSupabaseAdmin();
    if (!client) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q');

    if (!search || search.length < 2) {
      return NextResponse.json([]);
    }

    // Busca por Código, Sigla ou Razão Social
    try {
      const { data, error } = await client
        .from('clientes_base')
        .select('*')
        .or(`codigo_cliente.ilike.%${search}%,sigla.ilike.%${search}%,razao_social.ilike.%${search}%`)
        .limit(10);

      if (error) {
        console.error("Supabase Error in search:", error);
        return NextResponse.json({ error: error.message, details: error }, { status: 400 });
      }

      return NextResponse.json(data || []);
    } catch (innerError: any) {
       console.error("Inner Search Error:", innerError);
       return NextResponse.json({ error: innerError.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Search Clientes Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
