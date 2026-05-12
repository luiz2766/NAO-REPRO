'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Upload, FileText, X, Check, Loader2, AlertCircle, Import as LucideImport } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export function ImportModal({ isOpen, onClose, onSuccess }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;
    
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'xlsx' && fileExt !== 'xls' && fileExt !== 'csv') {
      toast.error("Formato de arquivo inválido. Use .xlsx, .xls ou .csv");
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bstr = e.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(ws);
        
        // Mapeamento exaustivo para lidar com os nomes das colunas da imagem do usuário
        const mappedData = rawData.map((row: any) => ({
          n_rota: String(row["Nº ROTA"] || row["N° ROT;"] || row["Rota"] || row["n_rota"] || ""),
          placa_veiculo: String(row["PLACA VEICULO"] || row["PLACA VEICU"] || row["Placa"] || row["placa_veiculo"] || ""),
          motorista: String(row["MOTORISTA"] || row["Motorista"] || row["motorista"] || ""),
          n_lote: String(row["Nº LOTE"] || row["N° LOTE"] || row["Lote"] || row["n_lote"] || ""),
          pedido: String(row["PEDIDO"] || row["PEDIDOS"] || row["Pedido"] || row["pedido"] || ""),
          qtde_ordens: Number(row["QTDE ORDE"] || row["QTDE ORDENS"] || row["Quantidade"] || row["qtde_ordens"]) || 0,
          data_pedido: row["DATA DO PEDIDO"] || row["DATA DO PEDIC"] || row["Data"] || row["data_pedido"],
          cod_cliente: String(row["COD CLIENTE"] || row["COD CLIENT"] || row["Código"] || row["cod_cliente"] || ""),
          razao_social: String(row["RAZÃO SOCIAL"] || row["Cliente"] || row["razao_social"] || ""),
          cep: String(row["CEP"] || row["cep"] || ""),
          endereco: String(row["ENDERECO"] || row["ENDEREÇO"] || row["endereco"] || ""),
          bairro: String(row["BAIRRO"] || row["Bairro"] || row["bairro"] || ""),
          cidade: String(row["Cidades"] || row["Cidade"] || row["cidade"] || ""),
          estado: String(row["ESTADO"] || row["Estado"] || row["estado"] || ""),
          peso_pedido: Number(row["PESO PEDIDO"] || row["PESO PE"] || row["Peso"] || row["peso_pedido"]) || 0,
          peso_total: Number(row["PESO TOTAL"] || row["PESO TC"] || row["peso_total"]) || 0,
          valor: Number(row["VALOR"] || row["Valor"] || row["valor"]) || 0,
          tipo: String(row["TIPO"] || row["Tipo"] || row["tipo"] || "")
        }));
        
        // Formatar datas para string YYYY-MM-DD
        const formattedData = mappedData.map(row => {
          let dateStr = row.data_pedido;
          if (dateStr instanceof Date) {
            dateStr = dateStr.toISOString().split('T')[0];
          } else if (typeof dateStr === 'string' && dateStr.includes('/')) {
             const parts = dateStr.split('/');
             if (parts.length === 3) dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
          return { ...row, data_pedido: dateStr };
        });

        setData(formattedData);
      } catch (err) { 
        console.error(err);
        toast.error("Erro ao ler o arquivo. Verifique a estrutura."); 
      }
      finally { setIsProcessing(false); }
    };
    reader.readAsBinaryString(selectedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

  const handleUpload = async () => {
    if (!data.length) return;
    setIsUploading(true);
    try {
      const res = await fetch('/api/pedidos/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_arquivo: file?.name, pedidos: data })
      });
      
      const result = await res.json();
      if (res.ok) { 
        toast.success(`Importação concluída: ${result.total} registros salvos.`); 
        onSuccess(); 
        onClose(); 
        setFile(null);
        setData([]);
      } else {
        throw new Error(result.error || "Erro desconhecido no upload");
      }
    } catch (err: any) {
      toast.error(`Falha no upload: ${err.message}`);
    } finally { setIsUploading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl rounded-[32px] border-none shadow-2xl p-8 bg-white overflow-hidden">
        <DialogHeader className="mb-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
             <LucideImport size={24} strokeWidth={2.5} />
          </div>
          <DialogTitle className="text-3xl font-bold tracking-tight">Importar Dados Logísticos</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">Sincronize sua base de dados com arquivos externos (XLSX, XLS ou CSV).</DialogDescription>
        </DialogHeader>

        {!file ? (
          <div 
            {...getRootProps()} 
            className={cn(
              "border-2 border-dashed rounded-[24px] p-16 text-center cursor-pointer transition-all duration-300 group",
              isDragActive ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
            )}
          >
            <input {...getInputProps()} />
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
               <Upload className="text-slate-400 group-hover:text-blue-600" size={32} strokeWidth={2.5} />
            </div>
            <p className="text-lg font-bold text-slate-900 mb-1">Arraste seu arquivo aqui</p>
            <p className="text-sm text-slate-500 font-medium">ou clique para selecionar do seu computador</p>
            <div className="mt-8 flex items-center justify-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
               <span>XLSX</span>
               <div className="w-1 h-1 bg-slate-300 rounded-full" />
               <span>XLS</span>
               <div className="w-1 h-1 bg-slate-300 rounded-full" />
               <span>CSV</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
             <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Check size={20} strokeWidth={2.5} />
                 </div>
                 <div>
                    <p className="font-bold text-slate-900 text-sm line-clamp-1">{file.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data.length} registros identificados</p>
                 </div>
               </div>
               <Button variant="ghost" size="icon" className="hover:bg-rose-50 hover:text-rose-600 rounded-xl" onClick={() => {setFile(null); setData([]);}}>
                 <X size={20} strokeWidth={2.5} />
               </Button>
             </div>

             <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
               <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prévia dos Dados</p>
               </div>
               <ScrollArea className="h-64 bg-white">
                  <Table>
                     <TableHeader>
                        <TableRow className="hover:bg-transparent">
                           <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Data</TableHead>
                           <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Razão Social</TableHead>
                           <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Cidade</TableHead>
                           <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Valor</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {data.slice(0, 10).map((r, i) => (
                          <TableRow key={i} className="font-medium text-xs border-b border-slate-50">
                             <TableCell className="font-mono text-slate-500">{r.data_pedido}</TableCell>
                             <TableCell className="font-bold text-slate-700">{r.razao_social}</TableCell>
                             <TableCell className="text-slate-500">{r.cidade || "-"}</TableCell>
                             <TableCell className="font-bold text-slate-900">R${r.valor?.toLocaleString('pt-BR')}</TableCell>
                          </TableRow>
                        ))}
                     </TableBody>
                  </Table>
                  {data.length > 10 && (
                    <div className="p-4 text-center bg-slate-50/50">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">e mais {data.length - 10} registros...</p>
                    </div>
                  )}
               </ScrollArea>
             </div>
             
             <div className="flex gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <AlertCircle className="text-blue-500 shrink-0" size={18} strokeWidth={2.5} />
                <p className="text-[11px] text-blue-700 leading-relaxed font-medium">Certifique-se de que as colunas do seu arquivo correspondam aos campos esperados pelo sistema para uma sincronização perfeita.</p>
             </div>
          </div>
        )}

        <DialogFooter className="mt-8 gap-3 sm:gap-0">
          <Button variant="ghost" className="rounded-xl font-bold text-slate-500 hover:bg-slate-50" onClick={onClose} disabled={isUploading}>Cancelar Operação</Button>
          <Button 
            disabled={!data.length || isUploading} 
            className="rounded-xl primary-gradient border-none shadow-lg shadow-blue-500/25 h-12 px-8 font-bold text-sm min-w-[160px]" 
            onClick={handleUpload}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={18} strokeWidth={2.5} />
                Processando...
              </>
            ) : (
              <>
                <Check className="mr-2" size={18} strokeWidth={2.5} />
                Executar Sincronia
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
