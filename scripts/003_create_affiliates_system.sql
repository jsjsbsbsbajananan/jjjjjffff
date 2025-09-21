-- Criar tabela de afiliados
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_code TEXT UNIQUE NOT NULL,
  user_email TEXT UNIQUE NOT NULL,
  user_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  total_referrals INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de vendas por afiliado
CREATE TABLE IF NOT EXISTS affiliate_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  key_id UUID REFERENCES access_keys(id) ON DELETE CASCADE,
  buyer_email TEXT NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  key_type TEXT NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de cliques/referências
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  visitor_ip TEXT,
  user_agent TEXT,
  referrer_url TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar campo de referência na tabela access_keys
ALTER TABLE access_keys 
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES affiliates(id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_affiliate_id ON affiliate_sales(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_access_keys_referred_by ON access_keys(referred_by);

-- Função para atualizar estatísticas do afiliado
CREATE OR REPLACE FUNCTION update_affiliate_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar estatísticas quando uma nova venda é feita
  IF TG_OP = 'INSERT' THEN
    UPDATE affiliates 
    SET 
      total_earnings = total_earnings + NEW.commission_amount,
      total_sales = total_sales + 1,
      updated_at = NOW()
    WHERE id = NEW.affiliate_id;
    
    -- Atualizar total de referrals
    UPDATE affiliates 
    SET 
      total_referrals = (
        SELECT COUNT(*) 
        FROM access_keys 
        WHERE referred_by = NEW.affiliate_id
      ),
      active_referrals = (
        SELECT COUNT(*) 
        FROM access_keys 
        WHERE referred_by = NEW.affiliate_id 
        AND status = 'Ativo'
        AND (expires_at IS NULL OR expires_at > NOW())
      )
    WHERE id = NEW.affiliate_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar estatísticas automaticamente
DROP TRIGGER IF EXISTS trigger_update_affiliate_stats ON affiliate_sales;
CREATE TRIGGER trigger_update_affiliate_stats
  AFTER INSERT ON affiliate_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_stats();

-- Inserir alguns dados de exemplo (opcional)
INSERT INTO affiliates (affiliate_code, user_email, user_name, password_hash) VALUES
('AFF001', 'afiliado1@example.com', 'João Silva', '$2a$10$example_hash_1'),
('AFF002', 'afiliado2@example.com', 'Maria Santos', '$2a$10$example_hash_2')
ON CONFLICT (affiliate_code) DO NOTHING;
