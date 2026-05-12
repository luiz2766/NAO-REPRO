import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const client = getSupabaseAdmin();
    if (!client) {
      return NextResponse.json({ error: "Supabase not configured", data: [], total: 0 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '25'));
    const cidade = searchParams.get('cidade');
    const bairro = searchParams.get('bairro');
    const codCliente = searchParams.get('cod_cliente');
    const dataPedido = searchParams.get('data_pedido');
    const lastImport = searchParams.get('last_import') === 'true';

    let query = client.from('pedidos').select('*', { count: 'exact' });
    
    if (lastImport) {
      // Buscar o ID da última importação
      const { data: latestImportData } = await client
        .from('importacoes')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (latestImportData) {
        query = query.eq('importacao_id', latestImportData.id);
      }
    }

    if (cidade) query = query.ilike('cidade', `%${cidade}%`);
    if (bairro) query = query.ilike('bairro', `%${bairro}%`);
    if (codCliente) query = query.ilike('cod_cliente', `%${codCliente}%`);
    if (dataPedido) query = query.eq('data_pedido', dataPedido);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, count, error } = await query
      .order('data_pedido', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.error("Supabase query error in /api/pedidos:", {
        error,
        page,
        limit,
        from,
        to,
        count
      });
      return NextResponse.json({ 
        error: error.message, 
        details: error.details,
        data: [], 
        total: 0 
      });
    }

    return NextResponse.json({ data, total: count, page, limit });
  } catch (error: any) { 
    console.error("Pedidos Route Critical Error:", error);
    return NextResponse.json({ error: error.message, data: [], total: 0 }, { status: 500 }); 
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = getSupabaseAdmin();
    if (!client) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const body = await req.json();
    const { data, error } = await client.from('pedidos').insert([body]).select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error("Create Pedido Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
