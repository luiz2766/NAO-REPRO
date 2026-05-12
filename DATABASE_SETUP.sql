-- CONFIGURAÇÃO DO BANCO DE DADOS - ORDERFLOW
-- Copie e cole este código no SQL Editor do seu projeto Supabase

-- 1. Tabela para rastrear as importações de arquivos
CREATE TABLE IF NOT EXISTS importacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_arquivo TEXT,
  total_registros INTEGER DEFAULT 0,
  total_valor DECIMAL(12, 2) DEFAULT 0,
  total_peso DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela principal de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  n_rota TEXT,
  placa_veiculo TEXT,
  motorista TEXT,
  n_lote TEXT,
  pedido TEXT,
  qtde_ordens INTEGER,
  data_pedido DATE NOT NULL,
  cod_cliente TEXT,
  razao_social TEXT,
  cep TEXT,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  peso_pedido DECIMAL(12, 2),
  peso_total DECIMAL(12, 2),
  valor DECIMAL(12, 2),
  tipo TEXT,
  importacao_id UUID REFERENCES importacoes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar Segurança de Linha (RLS) - Opcional para demo
ALTER TABLE importacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de acesso (Caso queira reativar RLS depois)
DROP POLICY IF EXISTS "Acesso público de leitura para importacoes" ON importacoes;
DROP POLICY IF EXISTS "Acesso público de inserção para importacoes" ON importacoes;
DROP POLICY IF EXISTS "Acesso público de leitura para pedidos" ON pedidos;
DROP POLICY IF EXISTS "Acesso público de inserção para pedidos" ON pedidos;

CREATE POLICY "Acesso total público para importacoes" ON importacoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total público para pedidos" ON pedidos FOR ALL USING (true) WITH CHECK (true);

-- 5. Índices para melhor performance nas consultas do dashboard
CREATE INDEX IF NOT EXISTS idx_pedidos_cidade ON pedidos(cidade);
CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos(data_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_cod_cliente ON pedidos(cod_cliente);

-- 6. DICA PARA CONFIGURAÇÃO
-- Certifique-se de configurar as seguintes variáveis de ambiente no seu projeto Vercel/AI Studio:
-- NEXT_PUBLIC_SUPABASE_URL=Sua URL do Supabase
-- NEXT_PUBLIC_SUPABASE_ANON_KEY=Sua Chave Anon do Supabase
