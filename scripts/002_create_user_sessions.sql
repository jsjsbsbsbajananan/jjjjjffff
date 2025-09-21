-- Criar tabela para armazenar sessões de usuários autenticados por chave
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  key_id UUID REFERENCES public.access_keys(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura das sessões
CREATE POLICY "Allow read access to sessions" ON public.user_sessions 
FOR SELECT USING (true);

-- Política para permitir inserção de sessões
CREATE POLICY "Allow insert sessions" ON public.user_sessions 
FOR INSERT WITH CHECK (true);

-- Política para permitir atualização de sessões
CREATE POLICY "Allow update sessions" ON public.user_sessions 
FOR UPDATE USING (true);

-- Política para permitir exclusão de sessões
CREATE POLICY "Allow delete sessions" ON public.user_sessions 
FOR DELETE USING (true);
