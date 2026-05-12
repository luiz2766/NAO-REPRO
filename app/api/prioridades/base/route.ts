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

    // Debug: Check table count (optional, but helpful for initial troubleshooting)
    const { count: totalCount } = await client
      .from('clientes_base')
      .select('*', { count: 'exact', head: true });
    
    console.log(`Search query: "${search}". Total records in base: ${totalCount}`);

    // Busca por Código, Sigla ou Razão Social
    try {
      // 1. Verificar se a tabela está acessível e tem dados
      const { count: checkCount, error: checkError } = await client
        .from('clientes_base')
        .select('*', { count: 'exact', head: true });
      
      if (checkError) {
        console.error("Accessibility Error:", checkError);
        return NextResponse.json({ 
          error: "A tabela de clientes base não está acessível. Verifique o RLS no Supabase.",
          details: checkError 
        }, { status: 500 });
      }

      if (checkCount === 0) {
        return NextResponse.json({ 
          warning: "A base de clientes está vazia. Importe o CSV primeiro.",
          data: []
        });
      }

      // 2. Busca real
      const { data, error } = await client
        .from('clientes_base')
        .select('*')
        .or(`codigo_cliente.ilike.%${search}%,sigla.ilike.%${search}%,razao_social.ilike.%${search}%`)
        .limit(15);

      if (error) {
        console.error("Supabase Error in search:", error);
        // Fallback: tentar busca exata por código se o ilike falhar (pode ser tipo numérico)
        const { data: exactData, error: exactError } = await client
          .from('clientes_base')
          .select('*')
          .eq('codigo_cliente', search)
          .limit(1);
        
        if (!exactError && exactData && exactData.length > 0) {
          return NextResponse.json(exactData);
        }

        return NextResponse.json({ error: error.message, details: error }, { status: 400 });
      }

      console.log(`Search result for "${search}": ${data?.length || 0} items`);
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
