-- Criar tabela para armazenar as chaves de acesso
CREATE TABLE IF NOT EXISTS public.access_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_code TEXT UNIQUE NOT NULL,
  key_type TEXT NOT NULL CHECK (key_type IN ('1 mês', '3 meses')),
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Expirado', 'Desativado')),
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT DEFAULT 'admin'
);

-- Habilitar RLS na tabela
ALTER TABLE public.access_keys ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura das chaves (para validação de login)
CREATE POLICY "Allow read access to keys" ON public.access_keys 
FOR SELECT USING (true);

-- Política para permitir inserção apenas pelo admin
CREATE POLICY "Allow admin to insert keys" ON public.access_keys 
FOR INSERT WITH CHECK (true);

-- Política para permitir atualização apenas pelo admin
CREATE POLICY "Allow admin to update keys" ON public.access_keys 
FOR UPDATE USING (true);

-- Política para permitir exclusão apenas pelo admin
CREATE POLICY "Allow admin to delete keys" ON public.access_keys 
FOR DELETE USING (true);

-- Inserir algumas chaves de exemplo
INSERT INTO public.access_keys (key_code, key_type, user_email, expires_at) VALUES
('VIP-ABCD-1234-EFGH', '1 mês', 'user123@email.com', NOW() + INTERVAL '1 month'),
('VIP-WXYZ-5678-IJKL', '3 meses', 'user456@email.com', NOW() + INTERVAL '3 months');
