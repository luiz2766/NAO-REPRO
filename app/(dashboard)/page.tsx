'use client';

import React, { useEffect, useState } from 'react';
export const dynamic = 'force-dynamic';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { KPICard } from '@/components/dashboard/kpi-card';
import { 
  Package, 
  DollarSign, 
  Truck, 
  MapPin, 
  Users,
  TrendingUp,
  ArrowRight,
  Database
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell,
  LabelList
} from 'recharts';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [resumo, setResumo] = useState<any>(null);
  const [cidadeData, setCidadeData] = useState<any[]>([]);
  const [dataData, setDataData] = useState<any[]>([]);
  const [reprogramados, setReprogramados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const exportReport = () => {
    if (!resumo || !cidadeData.length || !dataData.length) {
      toast.error("Dados insuficientes para exportar.");
      return;
    }

    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      // Aba 1: Resumo Geral
      const wsResumo = XLSX.utils.json_to_sheet([{
        'Total Pedidos': resumo.totalPedidos,
        'Valor Total (R$)': resumo.valorTotal,
        'Peso Total (kg)': resumo.pesoTotal,
        'Cidades Atendidas': resumo.totalCidades,
        'Total Clientes': resumo.totalClientes
      }]);
      XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo Geral");

      // Aba 2: Por Cidade
      const wsCidade = XLSX.utils.json_to_sheet(cidadeData.map(c => ({
        'Cidade': c.name,
        'Valor': c.value
      })));
      XLSX.utils.book_append_sheet(wb, wsCidade, "Por Cidade");

      // Aba 3: Por Data
      const wsData = XLSX.utils.json_to_sheet(dataData.map(d => ({
        'Data': d.name,
        'Valor': d.valor
      })));
      XLSX.utils.book_append_sheet(wb, wsData, "Por Data");

      // Aba 4: Reprogramados
      if (reprogramados.length > 0) {
        const wsReprog = XLSX.utils.json_to_sheet(reprogramados.map(r => ({
          'Código': r.cod_cliente,
          'Cliente': r.razao_social,
          'Dias Reprogramados': r.dias_reprogramados
        })));
        XLSX.utils.book_append_sheet(wb, wsReprog, "Top Reprogramados");
      }

      XLSX.writeFile(wb, `Relatorio_Dashboard_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Relatório exportado com sucesso!");
    } catch (err) {
      console.error("Erro ao exportar:", err);
      toast.error("Falha ao gerar o relatório.");
    } finally {
      setExporting(true);
      setTimeout(() => setExporting(false), 500);
    }
  };

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      try {
        const [res, city, date, reprog] = await Promise.all([
          fetch('/api/dashboard/resumo').then(async r => {
            const data = await r.json();
            if (data.error) throw new Error(data.error);
            return data;
          }),
          fetch('/api/dashboard/por-cidade').then(r => r.ok ? r.json() : []),
          fetch('/api/dashboard/por-data').then(r => r.ok ? r.json() : []),
          fetch('/api/dashboard/top-reprogrammed').then(r => r.ok ? r.json() : []),
        ]);
        setResumo(res || {});
        setCidadeData(Array.isArray(city) ? city : []);
        setDataData(Array.isArray(date) ? date : []);
        setReprogramados(Array.isArray(reprog) ? reprog : []);
      } catch (err: any) {
        console.error("Erro ao buscar dados:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !mounted) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
           <Skeleton className="h-10 w-64 rounded-xl" />
           <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Skeleton className="h-[400px] rounded-2xl" />
           <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Dashboard Logístico</h1>
          <p className="text-sm text-slate-500 font-medium">Bem-vindo de volta! Aqui está o resumo das suas operações.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
           <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Live System</span>
           </div>
           <Button 
             onClick={exportReport}
             disabled={exporting}
             className="flex-1 sm:flex-none rounded-xl primary-gradient border-none shadow-lg shadow-blue-500/25 h-11 px-6 font-bold text-sm"
           >
              <TrendingUp className="mr-2" size={18} strokeWidth={2.5} />
              <span className="whitespace-nowrap">{exporting ? 'Exportando...' : 'Exportar Relatório'}</span>
           </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-4 items-start shadow-sm border-l-4 border-l-rose-500 animate-in slide-in-from-top-2 duration-300">
           <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
             <Database size={20} strokeWidth={2.5} />
           </div>
           <div>
              <p className="text-sm font-bold text-rose-900 uppercase tracking-tight">Erro de Integração</p>
              <p className="text-xs text-rose-700 mt-0.5 line-clamp-1">{error}</p>
              <p className="text-[10px] text-rose-600/70 mt-2 font-medium">Verifique as variáveis de ambiente do Supabase e execute o SQL de configuração.</p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total de Pedidos" 
          value={resumo?.totalPedidos?.toLocaleString() || 0} 
          icon={Package} 
          trend={{ value: 12.5, isUp: true }}
          color="blue"
        />
        <KPICard 
          title="Faturamento Total" 
          value={`R$${((resumo?.valorTotal || 0) / 1000).toFixed(1)}k`} 
          icon={DollarSign} 
          trend={{ value: 8.2, isUp: true }}
          color="emerald"
        />
        <KPICard 
          title="Volume de Carga" 
          value={`${((resumo?.pesoTotal || 0) / 1000).toFixed(1)}T`} 
          icon={Truck} 
          trend={{ value: 3.1, isUp: false }}
          color="amber"
        />
        <KPICard 
          title="Alcance Regional" 
          value={resumo?.totalCidades || 0} 
          icon={MapPin} 
          description="CIDADES ATENDIDAS"
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm overflow-hidden relative group">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Curva de Faturamento</h2>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">performance temporal</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                <TrendingUp size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }} 
                    dy={15}
                    tickFormatter={(val) => new Date(val).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                    tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: '800', color: '#1e293b' }}
                    labelStyle={{ fontSize: '10px', fontWeight: '600', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                    formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturamento']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorValue)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                  >
                    <LabelList 
                      dataKey="valor" 
                      position="top" 
                      offset={12} 
                      content={(props: any) => {
                        const { x, y, value } = props;
                        if (value === undefined || value === null || value === 0) return null;
                        return (
                          <text 
                            x={x} 
                            y={y} 
                            dy={-6} 
                            fill="#3b82f6" 
                            fontSize={9} 
                            fontWeight="800" 
                            textAnchor="middle"
                            className="drop-shadow-sm"
                          >
                            {`R$${(value/1000).toFixed(1)}k`}
                          </text>
                        );
                      }}
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-slate-900">Cidades com Maior Volume</h2>
              <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 rounded-xl font-bold text-xs uppercase tracking-tight">Ver Tudo</Button>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cidadeData} layout="vertical" margin={{ left: 20, right: 40 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#1d4ed8" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} 
                    width={100}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, 'Volume']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="url(#barGradient)" 
                    barSize={16} 
                    radius={[0, 8, 8, 0]}
                    background={{ fill: '#f8fafc', radius: [0, 8, 8, 0] }}
                  >
                    <LabelList dataKey="value" position="right" fontSize={10} fontWeight={700} fill="#1e293b" offset={12} formatter={(val: any) => `R$${(val/1000).toFixed(1)}k`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden group min-h-[500px]">
             <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-5 group-hover:scale-110 transition-transform">
                <Users size={120} strokeWidth={1} />
             </div>
             
             <div className="relative z-10 h-full flex flex-col">
               <div className="mb-6">
                <h3 className="text-xl font-bold leading-tight text-slate-900">Top 10 Clientes</h3>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Mais Reprogramados</p>
               </div>
               
               <div className="flex-1 space-y-3">
                 {reprogramados.length > 0 ? (
                   reprogramados.map((client, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-300 border border-transparent hover:border-slate-100 ${i === 0 ? 'soft-gradient-blue' : 'bg-slate-50/50'}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${i === 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-200 text-slate-600'}`}>
                          {i + 1}
                        </div>
                        <div className="truncate">
                          <p className={`text-xs font-bold truncate ${i === 0 ? 'text-blue-900' : 'text-slate-700'}`}>
                            {client.razao_social}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium tracking-tight">Cód: {client.cod_cliente}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end shrink-0 pl-2">
                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm ${
                          client.dias_reprogramados > 5 ? 'bg-rose-100 text-rose-600' : 
                          client.dias_reprogramados > 2 ? 'bg-amber-100 text-amber-600' : 
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          {client.dias_reprogramados} {client.dias_reprogramados === 1 ? 'Dia' : 'Dias'}
                        </div>
                      </div>
                    </div>
                   ))
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                     <Package size={48} strokeWidth={1} className="mb-4 opacity-20" />
                     <p className="text-sm font-medium">Nenhum histórico detectado</p>
                   </div>
                 )}
               </div>
               
               <Link 
                 href="/pedidos"
                 className={cn(
                   buttonVariants({ variant: "outline" }),
                   "w-full mt-8 bg-transparent text-slate-600 hover:bg-slate-50 border-slate-200 rounded-2xl h-11 font-bold text-xs transition-all flex items-center justify-center gap-2"
                 )}
               >
                 Ver Detalhes dos Pedidos <ArrowRight size={14} />
               </Link>
             </div>
           </div>

           <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                   <Users size={24} />
                </div>
                <div>
                   <h4 className="font-bold text-slate-900">Base de Clientes</h4>
                   <p className="text-xs text-slate-500 font-medium">Rede de Parceiros</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-6">{resumo?.totalClientes || 0}</div>
              <p className="text-xs text-slate-600 leading-relaxed">Sua base cresceu <span className="text-emerald-600 font-bold">5.2%</span> nesta semana. Continue oferecendo um serviço de excelência.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
