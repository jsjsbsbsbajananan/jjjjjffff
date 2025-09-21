import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

export interface Affiliate {
  id: string
  affiliate_code: string
  user_email: string
  user_name: string
  commission_rate: number
  total_earnings: number
  total_referrals: number
  active_referrals: number
  total_sales: number
  status: string
  created_at: string
}

export interface AffiliateStats {
  total_earnings: number
  total_referrals: number
  active_referrals: number
  total_sales: number
  recent_sales: any[]
  monthly_earnings: any[]
  clicks_today: number
}

export async function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}

export async function loginAffiliate(
  email: string,
  password: string,
): Promise<{ success: boolean; affiliate?: Affiliate; error?: string; sessionToken?: string }> {
  try {
    console.log("[v0] Iniciando login para:", email)
    const supabase = await createSupabaseServerClient()

    const { data: affiliate, error } = await supabase
      .from("affiliates")
      .select("*")
      .eq("user_email", email)
      .eq("status", "active")
      .single()

    console.log("[v0] Resultado da busca do afiliado:", { affiliate: !!affiliate, error })

    if (error || !affiliate) {
      console.log("[v0] Afiliado não encontrado ou erro:", error)
      return { success: false, error: "Credenciais inválidas" }
    }

    const isValidPassword = await bcrypt.compare(password, affiliate.password_hash)
    console.log("[v0] Senha válida:", isValidPassword)

    if (!isValidPassword) {
      return { success: false, error: "Credenciais inválidas" }
    }

    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    console.log("[v0] Criando sessão com token:", sessionToken)

    const { error: sessionError } = await supabase.from("affiliate_sessions").insert({
      affiliate_id: affiliate.id,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    })

    if (sessionError) {
      console.log("[v0] Erro ao criar sessão:", sessionError)
      return { success: false, error: "Erro ao criar sessão" }
    }

    console.log("[v0] Login realizado com sucesso")
    return { success: true, affiliate, sessionToken }
  } catch (error) {
    console.error("[v0] Erro no login do afiliado:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

export async function registerAffiliate(
  email: string,
  name: string,
  password: string,
): Promise<{ success: boolean; affiliate?: Affiliate; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()

    // Verificar se já existe
    const { data: existing } = await supabase.from("affiliates").select("id").eq("user_email", email).single()

    if (existing) {
      return { success: false, error: "Email já cadastrado" }
    }

    // Gerar código de afiliado único
    const affiliateCode = await generateUniqueAffiliateCode()
    const passwordHash = await bcrypt.hash(password, 10)

    const { data: affiliate, error } = await supabase
      .from("affiliates")
      .insert({
        affiliate_code: affiliateCode,
        user_email: email,
        user_name: name,
        password_hash: passwordHash,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: "Erro ao criar conta" }
    }

    return { success: true, affiliate }
  } catch (error) {
    console.error("Erro no registro do afiliado:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

export async function getCurrentAffiliate(): Promise<Affiliate | null> {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("affiliate_session")?.value

    console.log("[v0] getCurrentAffiliate - Token do cookie:", sessionToken)

    if (!sessionToken) {
      console.log("[v0] getCurrentAffiliate - Nenhum token encontrado")
      return null
    }

    const supabase = await createSupabaseServerClient()

    // Verificar se a sessão é válida
    const { data: session, error: sessionError } = await supabase
      .from("affiliate_sessions")
      .select("affiliate_id, expires_at")
      .eq("session_token", sessionToken)
      .single()

    console.log("[v0] getCurrentAffiliate - Sessão encontrada:", !!session, "Erro:", sessionError)

    if (!session || new Date(session.expires_at) < new Date()) {
      // Sessão expirada, limpar cookie
      console.log("[v0] getCurrentAffiliate - Sessão expirada ou inválida")
      cookieStore.delete("affiliate_session")
      return null
    }

    // Buscar dados do afiliado
    const { data: affiliate, error: affiliateError } = await supabase
      .from("affiliates")
      .select("*")
      .eq("id", session.affiliate_id)
      .eq("status", "active")
      .single()

    console.log("[v0] getCurrentAffiliate - Afiliado encontrado:", !!affiliate, "Erro:", affiliateError)

    return affiliate
  } catch (error) {
    console.error("[v0] Erro ao obter afiliado atual:", error)
    return null
  }
}

export async function getAffiliateStats(affiliateId: string): Promise<AffiliateStats> {
  try {
    const supabase = await createSupabaseServerClient()

    // Buscar estatísticas básicas
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("total_earnings, total_referrals, active_referrals, total_sales")
      .eq("id", affiliateId)
      .single()

    // Buscar vendas recentes
    const { data: recentSales } = await supabase
      .from("affiliate_sales")
      .select("*, access_keys(key_type)")
      .eq("affiliate_id", affiliateId)
      .order("sale_date", { ascending: false })
      .limit(10)

    // Buscar ganhos mensais (últimos 6 meses)
    const { data: monthlyEarnings } = await supabase
      .from("affiliate_sales")
      .select("commission_amount, sale_date")
      .eq("affiliate_id", affiliateId)
      .gte("sale_date", new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString())

    // Buscar cliques de hoje
    const today = new Date().toISOString().split("T")[0]
    const { count: clicksToday } = await supabase
      .from("affiliate_clicks")
      .select("*", { count: "exact", head: true })
      .eq("affiliate_id", affiliateId)
      .gte("clicked_at", today)

    return {
      total_earnings: affiliate?.total_earnings || 0,
      total_referrals: affiliate?.total_referrals || 0,
      active_referrals: affiliate?.active_referrals || 0,
      total_sales: affiliate?.total_sales || 0,
      recent_sales: recentSales || [],
      monthly_earnings: monthlyEarnings || [],
      clicks_today: clicksToday || 0,
    }
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return {
      total_earnings: 0,
      total_referrals: 0,
      active_referrals: 0,
      total_sales: 0,
      recent_sales: [],
      monthly_earnings: [],
      clicks_today: 0,
    }
  }
}

export async function trackAffiliateClick(affiliateCode: string, request: Request): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id")
      .eq("affiliate_code", affiliateCode)
      .single()

    if (affiliate) {
      await supabase.from("affiliate_clicks").insert({
        affiliate_id: affiliate.id,
        visitor_ip: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
        referrer_url: request.headers.get("referer") || null,
      })
    }
  } catch (error) {
    console.error("Erro ao rastrear clique:", error)
  }
}

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

async function generateUniqueAffiliateCode(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  let code: string
  let isUnique = false

  while (!isUnique) {
    code = "AFF" + Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data } = await supabase.from("affiliates").select("id").eq("affiliate_code", code).single()

    if (!data) {
      isUnique = true
    }
  }

  return code!
}

export async function logoutAffiliate(): Promise<void> {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("affiliate_session")?.value

    if (sessionToken) {
      const supabase = await createSupabaseServerClient()

      // Remover sessão do banco
      await supabase.from("affiliate_sessions").delete().eq("session_token", sessionToken)
    }

    cookieStore.delete("affiliate_session")
  } catch (error) {
    console.error("Erro no logout:", error)
  }
}
