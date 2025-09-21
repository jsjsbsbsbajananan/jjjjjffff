import { type NextRequest, NextResponse } from "next/server"
import { accessKeys } from "../../../lib/shared-storage"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const key = searchParams.get("key")

    console.log("[v0] GET access-keys - total keys:", accessKeys.length)

    if (key) {
      // Buscar KEY específica
      const foundKey = accessKeys.find((k) => k.key === key && k.status === "active")
      if (foundKey) {
        // Verificar se não expirou
        const now = new Date()
        const expires = new Date(foundKey.expires_at)

        if (now > expires) {
          foundKey.status = "expired"
          return NextResponse.json({ success: false, message: "KEY expirada" })
        }

        return NextResponse.json({ success: true, data: foundKey })
      }
      return NextResponse.json({ success: false, message: "KEY não encontrada" })
    }

    if (email) {
      // Buscar KEYs por email
      const userKeys = accessKeys.filter((k) => k.email === email)
      return NextResponse.json({ success: true, data: userKeys })
    }

    // Retornar todas as KEYs (para admin)
    return NextResponse.json({ success: true, data: accessKeys })
  } catch (error) {
    console.error("Erro na API de access-keys:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
