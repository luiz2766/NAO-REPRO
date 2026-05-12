export interface Pedido {
  id: string;
  n_rota: string | null;
  placa_veiculo: string | null;
  motorista: string | null;
  n_lote: string | null;
  pedido: string | null;
  qtde_ordens: number | null;
  data_pedido: string;
  cod_cliente: string | null;
  razao_social: string | null;
  cep: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  peso_pedido: number | null;
  peso_total: number | null;
  valor: number | null;
  tipo: string | null;
  importacao_id: string | null;
  created_at: string;
}
