-- Criar usuário demo para testes
-- Email: demo@afiliado.com
-- Senha: demo123

INSERT INTO affiliates (
  affiliate_code,
  user_email,
  user_name,
  password_hash,
  commission_rate,
  total_earnings,
  total_referrals,
  active_referrals,
  total_sales,
  status,
  created_at
) VALUES (
  'AFFDEMO1',
  'demo@afiliado.com',
  'Usuário Demo',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: demo123
  0.10,
  1250.50,
  25,
  18,
  42,
  'active',
  NOW()
);

-- Inserir algumas vendas demo para mostrar estatísticas
INSERT INTO affiliate_sales (
  affiliate_id,
  access_key_id,
  sale_amount,
  commission_amount,
  sale_date
) 
SELECT 
  a.id,
  1, -- ID fictício da chave
  50.00,
  5.00,
  NOW() - INTERVAL '1 day'
FROM affiliates a 
WHERE a.user_email = 'demo@afiliado.com';

-- Inserir alguns cliques demo
INSERT INTO affiliate_clicks (
  affiliate_id,
  visitor_ip,
  user_agent,
  clicked_at
)
SELECT 
  a.id,
  '192.168.1.1',
  'Mozilla/5.0 Demo Browser',
  NOW() - INTERVAL '2 hours'
FROM affiliates a 
WHERE a.user_email = 'demo@afiliado.com';
