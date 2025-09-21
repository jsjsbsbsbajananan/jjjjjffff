import { type NextRequest, NextResponse } from "next/server"
import { registerAffiliate } from "@/lib/affiliate-auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    const result = await registerAffiliate(email, name, password)

    if (result.success) {
      return NextResponse.json({ success: true, affiliate: result.affiliate })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Erro na API de registro do afiliado:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
