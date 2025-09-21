import { type NextRequest, NextResponse } from "next/server"
import { logoutAffiliate } from "@/lib/affiliate-auth"

export async function POST(request: NextRequest) {
  try {
    await logoutAffiliate()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro no logout do afiliado:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
