-- Criar tabela de sessões de afiliados
CREATE TABLE IF NOT EXISTS affiliate_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_affiliate_sessions_token ON affiliate_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_affiliate_sessions_affiliate_id ON affiliate_sessions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_sessions_expires_at ON affiliate_sessions(expires_at);

-- Limpar sessões expiradas automaticamente
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM affiliate_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
