import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Listar prioridades ou Importar base
export async function GET() {
  try {
    const client = getSupabaseAdmin();
    if (!client) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const { data, error } = await client
      .from('clientes_prioridade')
      .select('*')
      .order('data_inclusao', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("Fetch Prioridades Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Adicionar à prioridade
export async function POST(req: NextRequest) {
  try {
    const client = getSupabaseAdmin();
    if (!client) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const body = await req.json();
    
    // Se for uma importação em massa (bulk import para clientes_base)
    if (body.importType === 'base') {
      const { data: records } = body;
      
      if (!Array.isArray(records)) {
        return NextResponse.json({ error: "Records must be an array" }, { status: 400 });
      }

      // Upsert na tabela clientes_base
      const { error } = await client
        .from('clientes_base')
        .upsert(records, { onConflict: 'codigo_cliente' });

      if (error) throw error;
      return NextResponse.json({ success: true, count: records.length });
    }

    // Se for adicionar um cliente individual à prioridade
    const { codigo_cliente, sigla, razao_social, vendedor } = body;

    const { data, error } = await client
      .from('clientes_prioridade')
      .insert([
        {
          codigo_cliente,
          sigla,
          razao_social,
          vendedor,
          data_inclusao: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      // Tratar duplicidade especificamente
      if (error.code === '23505') {
        return NextResponse.json({ error: "Este cliente já está na lista de prioridades." }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Prioridade Action Error:", error);
    // Extraímos a mensagem de forma mais robusta
    const errorMessage = error.message || (typeof error === 'string' ? error : JSON.stringify(error));
    return NextResponse.json({ 
      error: errorMessage,
      details: error.details || null,
      hint: error.hint || null,
      code: error.code || null
    }, { status: 500 });
  }
}
