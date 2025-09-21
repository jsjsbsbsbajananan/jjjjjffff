import { type NextRequest, NextResponse } from "next/server"
import { loginAffiliate } from "@/lib/affiliate-auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log("[v0] API Login - Recebido:", { email, hasPassword: !!password })

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const result = await loginAffiliate(email, password)
    console.log("[v0] API Login - Resultado:", {
      success: result.success,
      hasAffiliate: !!result.affiliate,
      hasToken: !!result.sessionToken,
    })

    if (result.success && result.sessionToken) {
      const response = NextResponse.json({ success: true, affiliate: result.affiliate })

      response.cookies.set("affiliate_session", result.sessionToken, {
        httpOnly: true,
        secure: false, // Desabilitando para desenvolvimento
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60, // 24 horas
      })

      console.log("[v0] API Login - Cookie definido:", result.sessionToken)
      return response
    } else {
      console.log("[v0] API Login - Falha:", result.error)
      return NextResponse.json({ success: false, error: result.error }, { status: 401 })
    }
  } catch (error) {
    console.error("[v0] API Login - Erro interno:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
