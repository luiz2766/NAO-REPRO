import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = getSupabaseAdmin();
    if (!client) return NextResponse.json([]);

    const { data: pedidos, error } = await client.from('pedidos').select('data_pedido, valor');
    
    if (error) {
      console.warn("Supabase Dashboard Data query error:", JSON.stringify(error));
      return NextResponse.json([]);
    }

    const dailyTotals: Record<string, number> = {};
    pedidos?.forEach((p: any) => { dailyTotals[p.data_pedido] = (dailyTotals[p.data_pedido] || 0) + (Number(p.valor) || 0); });
    const data = Object.entries(dailyTotals).map(([name, valor]) => ({ name, valor })).sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json(data);
  } catch (error: any) { 
    console.error("Dashboard Data Critical Error:", error);
    return NextResponse.json([]); 
  }
}
