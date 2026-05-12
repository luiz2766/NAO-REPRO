'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  UserPlus, 
  Trash2, 
  Upload, 
  CheckCircle2, 
  X, 
  Users, 
  AlertCircle,
  Clock,
  UserCheck
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Papa from 'papaparse';

interface ClienteBase {
  codigo_cliente: string;
  regiao: string;
  numero: string;
  sigla: string;
  razao_social: string;
  vendedor: string;
}

interface ClientePrioridade {
  id: string;
  codigo_cliente: string;
  sigla: string;
  razao_social: string;
  vendedor: string;
  data_inclusao: string;
}

export default function PrioridadesPage() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ClienteBase[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<ClienteBase | null>(null);
  const [prioridades, setPrioridades] = useState<ClientePrioridade[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [importing, setImporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPrioridades();
    
    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        searchClientes();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const fetchPrioridades = async () => {
    try {
      const res = await fetch('/api/prioridades');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPrioridades(data);
      }
    } catch (err) {
      console.error("Erro ao buscar prioridades:", err);
    }
  };

  const searchClientes = async () => {
    try {
      const res = await fetch(`/api/prioridades/base?q=${encodeURIComponent(query)}`);
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
        setShowSearchDropdown(true);
      } else {
        const text = await res.text();
        console.error("API returned non-json response:", text.substring(0, 500));
        toast.error("Erro na comunicação com o servidor. Verifique a base de dados.");
      }
    } catch (err) {
      console.error("Erro na busca:", err);
    }
  };

  const handleSelectCliente = (cliente: ClienteBase) => {
    setSelectedCliente(cliente);
    setQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  const handleAddPrioridade = async () => {
    if (!selectedCliente) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/prioridades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo_cliente: selectedCliente.codigo_cliente,
          sigla: selectedCliente.sigla,
          razao_social: selectedCliente.razao_social,
          vendedor: selectedCliente.vendedor
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao adicionar à prioridade");
      }

      toast.success("Cliente adicionado às prioridades!");
      setSelectedCliente(null);
      fetchPrioridades();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePrioridade = async (id: string) => {
    if (!confirm("Remover este cliente das prioridades?")) return;

    try {
      const res = await fetch(`/api/prioridades/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Prioridade removida");
        fetchPrioridades();
      } else {
        throw new Error(data.error || "Erro ao remover");
      }
    } catch (err: any) {
      console.error("Erro ao remover:", err);
      toast.error(err.message || "Falha ao remover prioridade");
    }
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: async (results) => {
        try {
          const transformed = results.data
            .filter((row: any) => {
              // Busca flexível de colunas (ignora case e espaços) e garante que não são vazias
              const regiao = (row.Regiao || row.regiao || row.REGIAO || '').toString().trim();
              const numero = (row.Numero || row.numero || row.NUMERO || '').toString().trim();
              return regiao !== '' && numero !== '';
            })
            .map((row: any) => {
              const regiao = (row.Regiao || row.regiao || row.REGIAO || '').toString().trim();
              const numero = (row.Numero || row.numero || row.NUMERO || '').toString().trim();
              const sigla = (row.Sigla || row.sigla || row.SIGLA || '').toString().trim();
              const razao = (row['Razão Social'] || row.RazaoSocial || row.RAZAO_SOCIAL || row.Razao || '').toString().trim();
              const vendedor = (row['Vend(1)'] || row.Vendedor || row.VENDEDOR || '').toString().trim();

              return {
                codigo_cliente: `${regiao}${numero}`,
                regiao,
                numero,
                sigla,
                razao_social: razao,
                vendedor
              };
            });

          if (transformed.length === 0) {
            toast.error("Nenhum dado válido encontrado. Verifique se as colunas 'Regiao' e 'Numero' existem e estão preenchidas.");
            setImporting(false);
            return;
          }

          // Chunking: Enviar em lotes de 1000
          const chunkSize = 1000;
          let importedCount = 0;

          for (let i = 0; i < transformed.length; i += chunkSize) {
            const chunk = transformed.slice(i, i + chunkSize);
            const res = await fetch('/api/prioridades', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                importType: 'base',
                data: chunk
              })
            });

            if (!res.ok) {
              const errorData = await res.json();
              // Se errorData.error for um objeto, pegamos a mensagem ou stringificamos
              const msg = typeof errorData.error === 'object' 
                ? (errorData.error.message || JSON.stringify(errorData.error))
                : errorData.error;
              throw new Error(msg || `Erro no lote ${Math.floor(i/chunkSize) + 1}`);
            }
            
            importedCount += chunk.length;
            if (transformed.length > 5000 && i % (chunkSize * 5) === 0) {
              toast.info(`Progresso: ${importedCount} de ${transformed.length}...`);
            }
          }

          toast.success(`Base atualizada: ${importedCount} clientes importados.`);
        } catch (err: any) {
          const displayError = err.message || JSON.stringify(err);
          toast.error("Erro na importação: " + displayError);
        } finally {
          setImporting(false);
          // Limpar input
          event.target.value = '';
        }
      },
      error: (err) => {
        toast.error("Erro ao ler arquivo CSV");
        setImporting(false);
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Clientes Prioritários</h1>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Gestão de urgências e atendimento preferencial.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
             <input 
               type="file" 
               accept=".csv" 
               className="hidden" 
               id="csv-import" 
               onChange={handleImportCSV} 
               disabled={importing}
             />
             <label 
               htmlFor="csv-import" 
               className={cn(
                 buttonVariants({ variant: "outline" }),
                 "w-full rounded-xl border-slate-200 h-11 px-6 font-bold text-xs cursor-pointer flex items-center justify-center gap-2"
               )}
             >
               <Upload size={16} /> 
               {importing ? "Processando..." : "Importar Base CSV"}
             </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna de Busca e Seleção */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm relative z-20">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Search size={14} /> Buscar Cliente
            </h3>
            
            <div className="space-y-4">
              <div className="relative" ref={dropdownRef}>
                <Input 
                  placeholder="Código, Sigla ou Razão Social..."
                  className="rounded-2xl border-slate-200 h-12 pl-4 text-sm font-medium"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => query.length >= 2 && setShowSearchDropdown(true)}
                />
                
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                    {searchResults.map((cliente) => (
                      <div 
                        key={cliente.codigo_cliente}
                        className="p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-slate-50 last:border-none"
                        onClick={() => handleSelectCliente(cliente)}
                      >
                        <p className="text-xs font-bold text-slate-800">{cliente.razao_social}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                            {cliente.codigo_cliente}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium truncate italic">
                            {cliente.sigla}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedCliente && (
                <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100 animate-in zoom-in-95 duration-200">
                   <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <Users size={20} />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-rose-500 rounded-xl"
                        onClick={() => setSelectedCliente(null)}
                      >
                        <X size={18} />
                      </Button>
                   </div>
                   
                   <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Razão Social</p>
                        <p className="text-sm font-bold text-blue-900 line-clamp-1">{selectedCliente.razao_social}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Código</p>
                          <p className="text-xs font-bold text-blue-800">{selectedCliente.codigo_cliente}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Sigla</p>
                          <p className="text-xs font-bold text-blue-800">{selectedCliente.sigla || '-'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Vendedor</p>
                        <p className="text-xs font-bold text-blue-800">{selectedCliente.vendedor || '-'}</p>
                      </div>
                   </div>

                   <Button 
                     className="w-full mt-6 rounded-2xl primary-gradient border-none h-12 font-bold shadow-lg shadow-blue-500/20"
                     onClick={handleAddPrioridade}
                     disabled={loading}
                   >
                     <UserPlus size={18} className="mr-2" />
                     Adicionar à Prioridade
                   </Button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[32px] p-8 text-white">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <AlertCircle size={20} className="text-amber-400" />
                </div>
                <h4 className="font-bold text-sm tracking-tight text-slate-100">Dica Operacional</h4>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed font-medium">
               A lista de prioridades sincroniza automaticamente com o roteirizador. 
               Clientes marcados aqui serão destacados na próxima importação de pedidos.
             </p>
          </div>
        </div>

        {/* Coluna da Tabela de Prioridades */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden min-h-[600px]">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Lista de Prioridades</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {prioridades.length} {prioridades.length === 1 ? "Registro" : "Registros"} Ativos
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <UserCheck size={24} />
                </div>
             </div>

             {prioridades.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow className="border-none bg-slate-50/50">
                     <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 py-4 px-8">Cliente</TableHead>
                     <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 py-4 px-6">Vendedor</TableHead>
                     <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 py-4 px-6">Data Inclusão</TableHead>
                     <TableHead className="py-4 px-8 text-right"></TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {prioridades.map((p) => (
                     <TableRow key={p.id} className="group border-b border-slate-50 hover:bg-slate-50/30 transition-all">
                       <TableCell className="py-6 px-8">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                               <span className="text-[10px] font-bold text-slate-400">#{p.codigo_cliente.slice(-4)}</span>
                             </div>
                             <div>
                               <p className="text-sm font-bold text-slate-900">{p.razao_social}</p>
                               <p className="text-[10px] font-bold text-slate-400 tracking-tight">Cód: {p.codigo_cliente} | {p.sigla}</p>
                             </div>
                          </div>
                       </TableCell>
                       <TableCell className="py-6 px-6">
                         <Badge variant="outline" className="rounded-lg border-slate-200 text-[10px] font-bold text-slate-500 py-1">
                           {p.vendedor || 'Geral'}
                         </Badge>
                       </TableCell>
                       <TableCell className="py-6 px-6">
                         <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                           <Clock size={12} className="text-slate-300" />
                           {new Date(p.data_inclusao).toLocaleDateString()}
                         </div>
                       </TableCell>
                       <TableCell className="py-6 px-8 text-right">
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-10 w-10 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300"
                           onClick={() => handleRemovePrioridade(p.id)}
                         >
                           <Trash2 size={18} />
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <div className="h-[400px] flex flex-col items-center justify-center text-center p-12">
                  <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-[32px] flex items-center justify-center mb-6">
                    <UserPlus size={40} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Nenhuma prioridade definida</h4>
                  <p className="text-sm text-slate-400 max-w-xs font-medium"> Use o campo de busca ao lado para identificar e adicionar clientes que precisam de atenção especial.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
