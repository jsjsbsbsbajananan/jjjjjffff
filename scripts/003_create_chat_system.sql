-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'image', 'video'
  file_url TEXT,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT DEFAULT 'admin'
);

-- Create chat_members table (for tracking who has access to which chats)
CREATE TABLE IF NOT EXISTS public.chat_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chats (admin can manage all, users can view)
CREATE POLICY "Admin can manage all chats" ON public.chats FOR ALL USING (true);
CREATE POLICY "Users can view active chats" ON public.chats FOR SELECT USING (is_active = true);

-- RLS Policies for chat_messages (admin can manage all, users can view messages from chats they're members of)
CREATE POLICY "Admin can manage all messages" ON public.chat_messages FOR ALL USING (true);
CREATE POLICY "Users can view messages from their chats" ON public.chat_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_members cm 
      WHERE cm.chat_id = chat_messages.chat_id 
      AND cm.user_email = current_setting('request.jwt.claims', true)::json->>'email'
      AND cm.is_active = true
    )
  );

-- RLS Policies for chat_members (admin can manage all, users can view their own memberships)
CREATE POLICY "Admin can manage all memberships" ON public.chat_members FOR ALL USING (true);
CREATE POLICY "Users can view their own memberships" ON public.chat_members FOR SELECT 
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Insert default chats
INSERT INTO public.chats (name, description, image_url) VALUES
  ('Vazados das Anãzinhas', 'Grupo exclusivo premium +18', '/images/banner-brasileirinhas.png'),
  ('VIP Premium', 'Conteúdo exclusivo para membros VIP', '/images/xvideos-red-complete.png'),
  ('Novidades', 'Últimas atualizações e novos conteúdos', '/images/pornhub-logo.png'),
  ('Geral', 'Chat geral da comunidade', '/images/privacy-logo-new.png'),
  ('Suporte', 'Tire suas dúvidas aqui', '/images/onlyfans-logo.png')
ON CONFLICT DO NOTHING;

-- Insert welcome messages
INSERT INTO public.chat_messages (chat_id, content, message_type, is_pinned, created_by) 
SELECT 
  c.id,
  CASE 
    WHEN c.name = 'Vazados das Anãzinhas' THEN '🔥 Bem-vindos ao grupo das Baixinhas Premium! Aqui vocês vão encontrar o melhor conteúdo exclusivo das anãzinhas mais gostosas da internet!'
    WHEN c.name = 'VIP Premium' THEN '👑 Área VIP exclusiva! Conteúdo premium disponível apenas para membros especiais.'
    WHEN c.name = 'Novidades' THEN '📢 Fique por dentro de todas as novidades e lançamentos!'
    WHEN c.name = 'Geral' THEN '💬 Chat geral para todos os membros da comunidade.'
    WHEN c.name = 'Suporte' THEN '🆘 Precisa de ajuda? Nossa equipe está aqui para você!'
  END,
  'text',
  true,
  'admin'
FROM public.chats c
ON CONFLICT DO NOTHING;
