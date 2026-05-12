'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pedido } from '@/types/pedido';
import { toast } from 'sonner';

interface PedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pedido?: Pedido | null;
}

export function PedidoModal({ isOpen, onClose, onSuccess, pedido }: PedidoModalProps) {
  const { register, handleSubmit, reset, setValue } = useForm<Partial<Pedido>>();

  useEffect(() => {
    if (pedido) {
      reset({
        n_rota: pedido.n_rota,
        placa_veiculo: pedido.placa_veiculo,
        motorista: pedido.motorista,
        n_lote: pedido.n_lote,
        pedido: pedido.pedido,
        qtde_ordens: pedido.qtde_ordens,
        data_pedido: pedido.data_pedido,
        cod_cliente: pedido.cod_cliente,
        razao_social: pedido.razao_social,
        cep: pedido.cep,
        endereco: pedido.endereco,
        bairro: pedido.bairro,
        cidade: pedido.cidade,
        estado: pedido.estado,
        peso_pedido: pedido.peso_pedido,
        peso_total: pedido.peso_total,
        valor: pedido.valor,
        tipo: pedido.tipo
      });
    } else {
      reset({
        data_pedido: new Date().toISOString().split('T')[0]
      });
    }
  }, [pedido, reset, isOpen]);

  const onSubmit = async (data: Partial<Pedido>) => {
    try {
      const url = pedido ? `/api/pedidos/${pedido.id}` : '/api/pedidos';
      const method = pedido ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erro ao salvar pedido');
      }

      toast.success(pedido ? 'Pedido atualizado!' : 'Pedido criado!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {pedido ? 'Editar Registro' : 'Novo Registro Logístico'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Data do Pedido</Label>
              <Input type="date" {...register('data_pedido')} className="rounded-xl border-slate-200" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Código Cliente</Label>
              <Input {...register('cod_cliente')} className="rounded-xl border-slate-200" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Razão Social</Label>
              <Input {...register('razao_social')} className="rounded-xl border-slate-200" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Cidade</Label>
              <Input {...register('cidade')} className="rounded-xl border-slate-200" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Bairro</Label>
              <Input {...register('bairro')} className="rounded-xl border-slate-200" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Valor</Label>
              <Input type="number" step="0.01" {...register('valor')} className="rounded-xl border-slate-200" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Peso</Label>
              <Input type="number" step="0.001" {...register('peso_pedido')} className="rounded-xl border-slate-200" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Nº Rota</Label>
              <Input {...register('n_rota')} className="rounded-xl border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Motorista</Label>
              <Input {...register('motorista')} className="rounded-xl border-slate-200" />
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancelar</Button>
            <Button type="submit" className="primary-gradient border-none rounded-xl font-bold px-8 shadow-lg shadow-blue-500/25">
              Salvar Registro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
