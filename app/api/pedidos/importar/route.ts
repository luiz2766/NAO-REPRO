import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const client = getSupabase();
    if (!client) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const { nome_arquivo, pedidos } = await req.json();
    const totalRegistros = pedidos.length;
    const totalValor = pedidos.reduce((acc: number, curr: any) => acc + (Number(curr.valor) || 0), 0);
    const totalPeso = pedidos.reduce((acc: number, curr: any) => acc + (Number(curr.peso_pedido) || 0), 0);

    const { data: importacao, error: importError } = await client
      .from('importacoes')
      .insert([{
        nome_arquivo,
        total_registros: totalRegistros,
        total_valor: totalValor,
        total_peso: totalPeso,
      }])
      .select().single();

    if (importError) throw importError;

    const pedidosComImportacao = pedidos.map((p: any) => ({ ...p, importacao_id: importacao.id }));
    const { error: batchError } = await client.from('pedidos').insert(pedidosComImportacao);
    if (batchError) throw batchError;

    return NextResponse.json({ success: true, total: totalRegistros });
  } catch (error: any) { 
    console.error("Import Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 }); 
  }
}
