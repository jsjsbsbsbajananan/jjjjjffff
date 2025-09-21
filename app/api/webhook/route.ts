import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"

export async function POST(request: NextRequest) {
  const requestId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  try {
    const body = await request.json()
    console.log(`[v0] TriboPay webhook received [${requestId}]:`, body)

    const { transaction_hash, status, amount, payment_method, paid_at, customer } = body

    if (status === "paid") {
      console.log(`[v0] Payment confirmed [${requestId}]:`, {
        transaction_hash,
        amount,
        payment_method,
        paid_at,
        customer,
      })

      const accessKey = generateAccessKey()
      const customerEmail = customer?.email || "no-reply@seusite.com"
      const customerName = customer?.name || "Cliente"

      const keyType = amount === 2990 ? "3 meses" : "1 mês"
      const expirationMonths = amount === 2990 ? 3 : 1

      console.log(`[v0] Generated access key for ${customerName}: ${accessKey} (${keyType})`)

      const supabase = createClient()

      try {
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + expirationMonths)

        const { data: keyData, error: keyError } = await supabase
          .from("access_keys")
          .insert({
            key_code: accessKey,
            key_type: keyType,
            status: "Ativo",
            user_email: customerEmail,
            expires_at: expiresAt.toISOString(),
            created_by: "tribopay_webhook",
          })
          .select()
          .single()

        if (keyError) {
          console.error(`[v0] Error saving access key to database:`, keyError)
        } else {
          console.log(`[v0] Access key saved to database successfully:`, keyData)
        }

        const emailContent = {
          to: customerEmail,
          subject: "🔑 Seu Acesso VIP foi Liberado - Vazados das Anãzinhas",
          body: `
            Olá ${customerName}!
            
            Seu pagamento foi confirmado e seu acesso VIP foi liberado!
            
            🔑 Sua chave de acesso: ${accessKey}
            ⏰ Válida por: ${keyType}
            
            Para acessar o conteúdo:
            1. Acesse: ${process.env.NEXT_PUBLIC_SITE_URL || "https://seusite.com"}/auth/login
            2. Digite sua chave de acesso: ${accessKey}
            3. Aproveite o conteúdo exclusivo!
            
            Sua chave expira em: ${expiresAt.toLocaleDateString("pt-BR")}
            
            Obrigado pela preferência!
            Equipe Vazados das Anãzinhas
          `,
        }

        console.log(`[v0] Access key generated and ready to send:`, emailContent)

        // TODO: Implement actual email sending service
        // await sendEmail(emailContent)
      } catch (dbError) {
        console.error(`[v0] Database error while processing payment:`, dbError)
      }

      console.log(`[v0] Order ${transaction_hash} processed successfully with access key`)
    } else {
      console.log(`[v0] Payment status update [${requestId}]:`, {
        transaction_hash,
        status,
      })
    }

    return NextResponse.json({ success: true, received: true }, { status: 200 })
  } catch (error) {
    console.error(`[v0] Webhook processing error [${requestId}]:`, error)
    return NextResponse.json({ success: false, error: "Processing failed" }, { status: 200 })
  }
}

function generateAccessKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = "VIP-"

  // Generate format: VIP-XXXX-XXXX-XXXX
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) {
      result += "-"
    }
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}
