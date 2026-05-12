import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = getSupabaseAdmin();
    if (!client) {
      return NextResponse.json({ 
        totalPedidos: 0, valorTotal: 0, pesoTotal: 0, totalCidades: 0, totalClientes: 0,
        error: "Supabase not configured" 
      });
    }

    const { data: pedidos, error } = await client.from('pedidos').select('valor, peso_pedido, cidade, cod_cliente');
    
    if (error) {
      console.warn("Supabase query error:", error);
      return NextResponse.json({
        totalPedidos: 0, valorTotal: 0, pesoTotal: 0,
        totalCidades: 0, totalClientes: 0,
        error: error.message
      });
    }

    const totalPedidos = pedidos?.length || 0;
    const valorTotal = pedidos?.reduce((acc: number, curr: any) => acc + (Number(curr.valor) || 0), 0) || 0;
    const pesoTotal = pedidos?.reduce((acc: number, curr: any) => acc + (Number(curr.peso_pedido) || 0), 0) || 0;
    const uniqueCities = new Set(pedidos?.map((p: any) => p.cidade).filter(Boolean));
    const uniqueClients = new Set(pedidos?.map((p: any) => p.cod_cliente).filter(Boolean));

    return NextResponse.json({
      totalPedidos, valorTotal, pesoTotal,
      totalCidades: uniqueCities.size, totalClientes: uniqueClients.size
    });
  } catch (error: any) { 
    console.error("Dashboard Resumo Critical Error:", error);
    return NextResponse.json({ 
      totalPedidos: 0, valorTotal: 0, pesoTotal: 0, totalCidades: 0, totalClientes: 0,
      error: error?.message || "Internal Server Error"
    }); 
  }
}
