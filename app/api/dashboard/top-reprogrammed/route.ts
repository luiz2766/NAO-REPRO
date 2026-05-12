import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface ClienteReprogramado {
  cod_cliente: string;
  razao_social: string;
  dias_reprogramados: number;
}

export async function GET() {
  try {
    const client = getSupabaseAdmin();
    if (!client) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    // Buscar pedidos com informações necessárias
    const { data: pedidos, error } = await client
      .from('pedidos')
      .select('cod_cliente, razao_social, data_pedido')
      .order('data_pedido', { ascending: false });

    if (error) throw error;
    if (!pedidos || pedidos.length === 0) return NextResponse.json([]);

    // 1. Identificar todas as datas únicas de importação, ordenadas da mais recente para a mais antiga
    const allDates = Array.from(new Set(pedidos.map(p => p.data_pedido))).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    if (allDates.length === 0) return NextResponse.json([]);

    // 2. Mapear quais clientes estão em quais datas
    const clientsByDate: { [date: string]: Set<string> } = {};
    const clientNames: { [cod: string]: string } = {};

    pedidos.forEach(p => {
      if (!clientsByDate[p.data_pedido]) {
        clientsByDate[p.data_pedido] = new Set();
      }
      clientsByDate[p.data_pedido].add(p.cod_cliente);
      clientNames[p.cod_cliente] = p.razao_social;
    });

    // 3. Os clientes "ativos" no momento são os que estão na data mais recente
    const latestDate = allDates[0];
    const activeClients = clientsByDate[latestDate];

    const result: ClienteReprogramado[] = [];

    // 4. Para cada cliente ativo, contar quantos dias consecutivos (para trás) ele aparece
    activeClients.forEach(cod => {
      let count = 0;
      for (const date of allDates) {
        if (clientsByDate[date].has(cod)) {
          count++;
        } else {
          // Se não estiver em uma data consecutiva, paramos de contar
          break;
        }
      }

      // Só conta como reprogramado se estiver em mais de 1 dia (o atual e pelo menos um anterior)
      // Ou pela lógica do usuário: "importo hoje e ele está, amanhã ele está, então tem 2 dias"
      // Se ele está apenas hoje, tem 1 dia (mas talvez só apareça na tabela se for > 1?)
      // O usuário quer o TOP 10 com maior quantidade de dias reprogramados.
      result.push({
        cod_cliente: cod,
        razao_social: clientNames[cod],
        dias_reprogramados: count
      });
    });

    // 5. Ordenar pelo número de dias e pegar os top 10
    const top10 = result
      .sort((a, b) => b.dias_reprogramados - a.dias_reprogramados)
      .slice(0, 10);

    return NextResponse.json(top10);
  } catch (error: any) {
    console.error("Erro ao carregar reprogramados:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
