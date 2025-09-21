import { type NextRequest, NextResponse } from "next/server"
import { trackAffiliateClick } from "@/lib/affiliate-auth"

export async function POST(request: NextRequest) {
  try {
    const { affiliateCode } = await request.json()

    if (!affiliateCode) {
      return NextResponse.json({ success: false, error: "Código de afiliado é obrigatório" }, { status: 400 })
    }

    await trackAffiliateClick(affiliateCode, request)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao rastrear clique:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
