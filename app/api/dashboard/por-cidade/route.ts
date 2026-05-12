import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = getSupabaseAdmin();
    if (!client) return NextResponse.json([]);

    const { data: pedidos, error } = await client.from('pedidos').select('cidade, valor');
    
    if (error) {
      console.warn("Supabase Dashboard City query error:", JSON.stringify(error));
      return NextResponse.json([]);
    }

    const cityTotals: Record<string, number> = {};
    pedidos?.forEach((p: any) => { if (p.cidade) cityTotals[p.cidade] = (cityTotals[p.cidade] || 0) + (Number(p.valor) || 0); });
    const data = Object.entries(cityTotals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
    return NextResponse.json(data);
  } catch (error: any) { 
    console.error("Dashboard City Critical Error:", error);
    return NextResponse.json([]); 
  }
}
