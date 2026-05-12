'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Import as LucideImport,
  TrendingUp,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Database,
  Calendar,
  MapPin,
  Tag,
  Star
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ImportModal } from '@/components/pedidos/import-modal';
import { PedidoModal } from '@/components/pedidos/pedido-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { Pedido } from '@/types/pedido';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function PedidosPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPedidoModalOpen, setIsPedidoModalOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCid, setFilterCid] = useState("");
  const [filterBairro, setFilterBairro] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showLastImportOnly, setShowLastImportOnly] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [prioridadesIds, setPrioridadesIds] = useState<Set<string>>(new Set());

  const fetchPrioridades = async () => {
    try {
      const res = await fetch('/api/prioridades');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPrioridadesIds(new Set(data.map(p => p.codigo_cliente)));
      }
    } catch (err) {
      console.error("Erro ao buscar prioridades para destaque:", err);
    }
  };

  const fetchPedidos = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '25',
        cidade: filterCid,
        bairro: filterBairro,
        cod_cliente: search,
        data_pedido: filterDate,
        last_import: String(showLastImportOnly)
      });
      const res = await fetch(`/api/pedidos?${params.toString()}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPedidos(data.data || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      console.error("Erro ao carregar pedidos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrioridades();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPedidos();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, filterCid, filterBairro, filterDate, search, showLastImportOnly]);

  const totalPages = Math.ceil(total / 25);
  const clearFilters = () => { setFilterCid(""); setFilterBairro(""); setFilterDate(""); setSearch(""); setShowLastImportOnly(true); setPage(1); };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    
    try {
      const res = await fetch(`/api/pedidos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Erro ao excluir");
      toast.success("Registro excluído com sucesso!");
      fetchPedidos();
    } catch (err) {
      toast.error("Falha ao excluir registro.");
    }
  };

  const handleEdit = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setIsPedidoModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedPedido(null);
    setIsPedidoModalOpen(true);
  };

  const exportData = async () => {
    if (pedidos.length === 0) {
      toast.error("Nenhum dado para exportar.");
      return;
    }

    setExporting(true);
    try {
      // Busca TODOS os registros com o filtro atual (sem paginação se possível, ou pelo menos os visíveis)
      // Para manter simples e rápido, vamos exportar o que está na página atual ou fazer uma query sem limite se for pequeno.
      // Por enquanto, exportamos os registros da página atual para não sobrecarregar.
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(pedidos.map(p => ({
        'Nº Rota': p.n_rota,
        'Cód. Cliente': p.cod_cliente,
        'Razão Social': p.razao_social,
        'Cidade': p.cidade,
        'Bairro': p.bairro,
        'Valor': p.valor,
        'Peso': p.peso_pedido,
        'Data': new Date(p.data_pedido).toLocaleDateString('pt-BR')
      })));
      XLSX.utils.book_append_sheet(wb, ws, "Pedidos");
      XLSX.writeFile(wb, `Pedidos_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Dados exportados com sucesso!");
    } catch (err) {
      toast.error("Erro ao exportar dados.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Base de Dados de Pedidos</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Gestão de Pedidos</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Visualize e organize seus registros logísticos com precisão.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
           <Button 
             variant="outline" 
             onClick={exportData} 
             disabled={exporting}
             className="flex-1 sm:flex-none rounded-xl border-slate-200 bg-white h-11 px-4 sm:px-6 font-bold text-xs sm:text-sm hover:bg-slate-50 shadow-sm"
           >
             <TrendingUp className="sm:mr-2" size={18} strokeWidth={2.5} /> 
             <span className="hidden sm:inline">{exporting ? 'Exportando...' : 'Exportar Dados'}</span>
           </Button>
           <Button variant="outline" className="flex-1 sm:flex-none rounded-xl border-slate-200 bg-white h-11 px-4 sm:px-6 font-bold text-xs sm:text-sm hover:bg-slate-50 shadow-sm" onClick={() => setIsImportModalOpen(true)}>
             <LucideImport className="sm:mr-2" size={18} strokeWidth={2.5} /> 
             <span className="hidden sm:inline">Importar XLS</span>
             <span className="sm:hidden">Importar</span>
           </Button>
           <Button 
             className="flex-[2] sm:flex-none rounded-xl primary-gradient border-none shadow-lg shadow-blue-500/25 h-11 px-4 sm:px-6 font-bold text-xs sm:text-sm"
             onClick={handleAdd}
           >
             <Plus className="mr-1 sm:mr-2" size={18} strokeWidth={2.5} /> Novo Registro
           </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-4 items-start shadow-sm border-l-4 border-l-rose-500">
           <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
             <Database size={20} strokeWidth={2.5} />
           </div>
           <div>
              <p className="text-sm font-bold text-rose-900 uppercase tracking-tight">Erro de Conexão</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              <p className="text-[10px] text-rose-600/70 mt-2 font-medium">Verifique as configurações do banco de dados no painel do Supabase.</p>
           </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative w-full md:w-96">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={2.5} />
             <Input 
               placeholder="Buscar por código de cliente..." 
               className="pl-11 h-12 border-slate-200 bg-white rounded-xl font-medium focus-visible:ring-blue-500 focus-visible:border-blue-500 shadow-sm transition-all"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && fetchPedidos()}
             />
          </div>
          
          <div className="flex items-center gap-3">
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => setShowLastImportOnly(!showLastImportOnly)}
               className={cn(
                 "rounded-xl h-12 px-4 font-bold text-xs transition-all flex items-center gap-2",
                 showLastImportOnly 
                   ? "bg-blue-50 text-blue-600 border border-blue-100" 
                   : "bg-slate-50 text-slate-500 border border-slate-100"
               )}
             >
               <Database size={16} />
               {showLastImportOnly ? "Última Importação" : "Todo o Histórico"}
             </Button>

             <Sheet>
               <SheetTrigger className={cn(
                 buttonVariants({ variant: "outline" }),
                 "h-12 border-slate-200 bg-white rounded-xl font-bold px-6 hover:bg-slate-50 shadow-sm"
               )}>
                 <Filter className="mr-2" size={18} strokeWidth={2.5} /> Filtros
               </SheetTrigger>
               <SheetContent className="w-[400px] sm:max-w-[400px] rounded-l-[40px] border-l-0 shadow-2xl">
                  <SheetHeader className="mt-8 mb-10">
                    <SheetTitle className="text-3xl font-bold tracking-tight">Refinar Busca</SheetTitle>
                    <p className="text-slate-500 text-sm font-medium">Aplique filtros para encontrar registros específicos.</p>
                  </SheetHeader>
                  <div className="space-y-8">
                     <div className="space-y-3">
                       <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Filtro por Data</Label>
                       <div className="relative">
                         <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <Input type="date" className="border-slate-200 rounded-xl h-12 pl-11" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                       </div>
                     </div>
                     <div className="space-y-3">
                       <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Filtro por Cidade</Label>
                       <div className="relative">
                         <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <Input className="border-slate-200 rounded-xl h-12 pl-11" placeholder="Ex: São Paulo" value={filterCid} onChange={(e) => setFilterCid(e.target.value)} />
                       </div>
                     </div>
                     <div className="space-y-3">
                       <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Filtro por Bairro</Label>
                       <div className="relative">
                         <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <Input className="border-slate-200 rounded-xl h-12 pl-11" placeholder="Ex: Centro" value={filterBairro} onChange={(e) => setFilterBairro(e.target.value)} />
                       </div>
                     </div>
                     <div className="pt-4 space-y-3">
                       <Button className="w-full h-12 primary-gradient border-none rounded-xl font-bold shadow-lg shadow-blue-500/25" onClick={() => { fetchPedidos(); }}>Aplicar Filtros</Button>
                       <Button variant="ghost" className="w-full h-12 text-slate-500 hover:bg-slate-50 rounded-xl font-bold" onClick={clearFilters}>Limpar Filtros</Button>
                     </div>
                  </div>
               </SheetContent>
             </Sheet>
             
             <div className="w-px h-8 bg-slate-200 mx-1" />
             
             <Button variant="ghost" size="icon" onClick={() => fetchPedidos()} className="h-12 w-12 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
               <RefreshCw size={20} className={cn(loading && "animate-spin")} strokeWidth={2.5} />
             </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-100 hover:bg-slate-50">
                <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-widest py-5 px-6">Data</TableHead>
                <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-widest py-5 px-6">Cliente / Razão Social</TableHead>
                <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-widest py-5 px-6">Localidade</TableHead>
                <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-widest py-5 px-6">Valor Operacional</TableHead>
                <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-widest py-5 px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5} className="py-6 px-6"><Skeleton className="h-12 w-full rounded-xl" /></TableCell></TableRow>
                ))
              ) : pedidos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                       <Database size={48} strokeWidth={1.5} />
                       <p className="font-bold text-lg uppercase tracking-tight">Nenhum registro encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : pedidos.map((p) => (
                <TableRow 
                  key={p.id} 
                  className={cn(
                    "border-b border-slate-50 hover:bg-slate-50/50 transition-colors group",
                    prioridadesIds.has(p.cod_cliente) && "bg-amber-50/30 hover:bg-amber-50/50"
                  )}
                >
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-2.5">
                       <div className={cn(
                         "hidden md:flex p-2 rounded-lg",
                         prioridadesIds.has(p.cod_cliente) ? "bg-amber-100 text-amber-600" : "bg-blue-50 text-blue-600"
                       )}>
                          {prioridadesIds.has(p.cod_cliente) ? <Star size={14} fill="currentColor" /> : <Calendar size={14} />}
                       </div>
                       <span className="font-mono font-bold text-slate-600 text-xs">{new Date(p.data_pedido).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <div>
                      <p className={cn("font-bold text-sm", prioridadesIds.has(p.cod_cliente) ? "text-amber-900" : "text-slate-900")}>
                        {p.razao_social}
                        {prioridadesIds.has(p.cod_cliente) && <Badge variant="outline" className="ml-2 border-amber-200 text-amber-600 font-bold bg-amber-50 text-[9px] py-0 px-1.5 rounded-md">PRIORIDADE</Badge>}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Cod: {p.cod_cliente}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-1.5">
                       <Badge variant="outline" className="rounded-lg bg-slate-50 border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 uppercase">{p.cidade}</Badge>
                       <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">{p.bairro}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <span className="font-bold text-slate-900 font-mono tracking-tight">
                      R${p.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 px-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100"
                        )}>
                          <MoreVertical size={16} strokeWidth={2.5} className="text-slate-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-2 min-w-[160px]">
                          <DropdownMenuItem className="rounded-xl font-bold text-xs p-3 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleEdit(p)}>
                             Editar Registro
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl font-bold text-xs p-3 cursor-pointer text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors" onClick={() => handleDelete(p.id)}>
                             Excluir permanentemente
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total de Registros</p>
            <p className="text-sm font-bold text-slate-900">{total} Pedidos</p>
          </div>
          
          <div className="flex items-center gap-2">
             <Button 
               variant="outline" 
               className="h-10 border-slate-200 rounded-xl px-4 font-bold text-xs disabled:opacity-40 shadow-sm"
               disabled={page === 1 || loading}
               onClick={() => setPage(page - 1)}
             >
               <ChevronLeft size={16} className="mr-1" /> Anterior
             </Button>
             
             <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                <span className="text-xs font-bold text-blue-600">{page}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">de {totalPages || 1}</span>
             </div>
             
             <Button 
               variant="outline" 
               className="h-10 border-slate-200 rounded-xl px-4 font-bold text-xs disabled:opacity-40 shadow-sm"
               disabled={page >= totalPages || loading}
               onClick={() => setPage(page + 1)}
             >
               Próximo <ChevronRight size={16} className="ml-1" />
             </Button>
          </div>
        </div>
      </div>

       <PedidoModal 
        isOpen={isPedidoModalOpen} 
        onClose={() => setIsPedidoModalOpen(false)} 
        onSuccess={() => fetchPedidos()} 
        pedido={selectedPedido}
      />

      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={() => fetchPedidos()} />
    </div>
  );
}
