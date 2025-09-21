import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get() {
          return undefined
        },
        set() {},
        remove() {},
      },
    })

    // Verificar se o usuário demo já existe
    const { data: existing } = await supabase
      .from("affiliates")
      .select("id")
      .eq("user_email", "demo@afiliado.com")
      .single()

    if (existing) {
      return NextResponse.json({ success: true, message: "Usuário demo já existe" })
    }

    // Criar usuário demo
    const passwordHash = await bcrypt.hash("demo123", 10)

    const { data: affiliate, error } = await supabase
      .from("affiliates")
      .insert({
        affiliate_code: "DEMO123",
        user_email: "demo@afiliado.com",
        user_name: "Usuário Demo",
        password_hash: passwordHash,
        commission_rate: 0.1,
        total_earnings: 1250.5,
        total_referrals: 25,
        active_referrals: 18,
        total_sales: 12,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar usuário demo:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Usuário demo criado com sucesso",
      credentials: {
        email: "demo@afiliado.com",
        password: "demo123",
      },
    })
  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
