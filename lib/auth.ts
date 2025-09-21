import { createClient } from "@/lib/supabase/client"

export interface AccessKey {
  id: string
  key_code: string
  key_type: string
  status: string
  user_email: string | null
  created_at: string
  expires_at: string
  last_used_at: string | null
}

export interface UserSession {
  id: string
  session_token: string
  key_id: string
  user_email: string
  created_at: string
  expires_at: string
  last_activity: string
}

// Validar chave de acesso
export async function validateAccessKey(
  keyCode: string,
): Promise<{ success: boolean; message: string; key?: AccessKey }> {
  const supabase = createClient()

  try {
    // Buscar a chave no banco de dados
    const { data: key, error } = await supabase
      .from("access_keys")
      .select("*")
      .eq("key_code", keyCode.toUpperCase())
      .single()

    if (error || !key) {
      return { success: false, message: "Chave não encontrada ou inválida." }
    }

    // Verificar se a chave está ativa
    if (key.status !== "Ativo") {
      return { success: false, message: "Esta chave foi desativada." }
    }

    // Verificar se a chave não expirou
    const now = new Date()
    const expiresAt = new Date(key.expires_at)

    if (expiresAt <= now) {
      // Atualizar status para expirado
      await supabase.from("access_keys").update({ status: "Expirado" }).eq("id", key.id)

      return { success: false, message: "Esta chave expirou." }
    }

    return { success: true, message: "Chave válida!", key }
  } catch (error) {
    console.error("Erro ao validar chave:", error)
    return { success: false, message: "Erro interno do servidor." }
  }
}

// Criar sessão de usuário
export async function createUserSession(key: AccessKey): Promise<{ success: boolean; sessionToken?: string }> {
  const supabase = createClient()

  try {
    // Gerar token de sessão único
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Calcular expiração da sessão (mesmo tempo que a chave)
    const expiresAt = new Date(key.expires_at)

    // Criar sessão no banco
    const { data: session, error } = await supabase
      .from("user_sessions")
      .insert({
        session_token: sessionToken,
        key_id: key.id,
        user_email: key.user_email || "usuario@anonimo.com",
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar sessão:", error)
      return { success: false }
    }

    // Atualizar último uso da chave
    await supabase.from("access_keys").update({ last_used_at: new Date().toISOString() }).eq("id", key.id)

    // Salvar token no localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("userSessionToken", sessionToken)
      localStorage.setItem("userKeyType", key.key_type)
      localStorage.setItem("userEmail", key.user_email || "usuario@anonimo.com")
    }

    return { success: true, sessionToken }
  } catch (error) {
    console.error("Erro ao criar sessão:", error)
    return { success: false }
  }
}

// Verificar se usuário está autenticado
export async function checkUserSession(): Promise<{ isAuthenticated: boolean; session?: UserSession }> {
  if (typeof window === "undefined") return { isAuthenticated: false }

  const sessionToken = localStorage.getItem("userSessionToken")
  if (!sessionToken) return { isAuthenticated: false }

  const supabase = createClient()

  try {
    const { data: session, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("session_token", sessionToken)
      .single()

    if (error || !session) {
      // Limpar localStorage se sessão não existe
      localStorage.removeItem("userSessionToken")
      localStorage.removeItem("userKeyType")
      localStorage.removeItem("userEmail")
      return { isAuthenticated: false }
    }

    // Verificar se sessão não expirou
    const now = new Date()
    const expiresAt = new Date(session.expires_at)

    if (expiresAt <= now) {
      // Remover sessão expirada
      await supabase.from("user_sessions").delete().eq("id", session.id)

      localStorage.removeItem("userSessionToken")
      localStorage.removeItem("userKeyType")
      localStorage.removeItem("userEmail")
      return { isAuthenticated: false }
    }

    // Atualizar última atividade
    await supabase.from("user_sessions").update({ last_activity: new Date().toISOString() }).eq("id", session.id)

    return { isAuthenticated: true, session }
  } catch (error) {
    console.error("Erro ao verificar sessão:", error)
    return { isAuthenticated: false }
  }
}

// Fazer logout
export async function logout(): Promise<void> {
  if (typeof window === "undefined") return

  const sessionToken = localStorage.getItem("userSessionToken")
  if (sessionToken) {
    const supabase = createClient()

    // Remover sessão do banco
    await supabase.from("user_sessions").delete().eq("session_token", sessionToken)
  }

  // Limpar localStorage
  localStorage.removeItem("userSessionToken")
  localStorage.removeItem("userKeyType")
  localStorage.removeItem("userEmail")
}
