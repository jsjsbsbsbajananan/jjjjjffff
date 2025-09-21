import { type NextRequest, NextResponse } from "next/server"

const PRODUCT_DELIVERY_CONFIG = {
  "Lives Vazadas - Mensal - R$ 19,90": {
    type: "digital_content",
    delivery_method: "email",
    content: {
      subject: "🎉 Seu acesso foi liberado! - Hot Flix Premium",
      message: `
Olá! 

Parabéns! Seu pagamento via MercadoPago foi confirmado e seu acesso ao Hot Flix Premium foi liberado com sucesso! 🚀

📱 SEUS DADOS DE ACESSO:
• Site: https://hottest123.vercel.app
• Login: Use o email que você cadastrou
• Senha: Você receberá em breve

🎯 O QUE VOCÊ TEM ACESSO AGORA:
✅ Conteúdo premium exclusivo
✅ Vídeos em alta qualidade
✅ Acesso ilimitado por 30 dias
✅ Suporte prioritário

💡 COMO ACESSAR:
1. Acesse: https://hottest123.vercel.app
2. Faça login com seu email
3. Aproveite todo o conteúdo premium!

Se tiver alguma dúvida, responda este email que te ajudaremos rapidamente.

Aproveite sua assinatura! 🔥

Equipe Hot Flix
      `,
    },
  },
  "Premium - Mensal - R$ 39,90": {
    type: "digital_content",
    delivery_method: "email",
    content: {
      subject: "🔥 Bem-vindo ao Hot Flix Premium Plus!",
      message: `
Olá!

Seu pagamento via MercadoPago foi confirmado! Bem-vindo ao Hot Flix Premium Plus! 🌟

📱 SEUS DADOS DE ACESSO:
• Site: https://hottest123.vercel.app
• Login: Use o email que você cadastrou
• Acesso: Premium Plus (todos os recursos)

🎯 SEUS BENEFÍCIOS PREMIUM PLUS:
✅ Todo conteúdo premium + exclusivos
✅ Vídeos em 4K
✅ Download para offline
✅ Acesso prioritário a novos conteúdos
✅ Suporte VIP 24/7

Aproveite sua experiência premium! 🚀

Equipe Hot Flix
      `,
    },
  },
}

async function sendDeliveryEmail(customerEmail: string, productName: string, customerName?: string) {
  try {
    const config = PRODUCT_DELIVERY_CONFIG[productName as keyof typeof PRODUCT_DELIVERY_CONFIG]

    if (!config) {
      console.log("[v0] No delivery config found for product:", productName)
      return false
    }

    console.log("[v0] Sending MercadoPago delivery email to:", customerEmail, "for product:", productName)

    const emailData = {
      to: customerEmail,
      subject: config.content.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #009ee3, #0066cc); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔥 Hot Flix</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Pagamento via MercadoPago confirmado!</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; line-height: 1.6;">
            ${config.content.message.replace(/\n/g, "<br>")}
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #e9ecef; border-radius: 10px;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
              Este email foi enviado automaticamente após a confirmação do seu pagamento via MercadoPago.
            </p>
          </div>
        </div>
      `,
      text: config.content.message,
    }

    // Simular envio de email (substitua por integração real)
    console.log("[v0] MERCADOPAGO EMAIL SENT SIMULATION:", emailData)

    return true
  } catch (error) {
    console.error("[v0] Error sending MercadoPago delivery email:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    console.log("[v0] MercadoPago Webhook received raw body:", body)

    // MercadoPago pode enviar diferentes tipos de notificação
    const searchParams = new URL(request.url).searchParams
    const type = searchParams.get("type")
    const dataId = searchParams.get("data.id")

    console.log("[v0] MercadoPago Webhook type:", type, "data.id:", dataId)

    // Se for notificação de pagamento
    if (type === "payment" && dataId) {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

      if (!accessToken) {
        console.error("[v0] MercadoPago access token not configured for webhook")
        return NextResponse.json({ success: false }, { status: 500 })
      }

      // Buscar detalhes do pagamento
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!paymentResponse.ok) {
        console.error("[v0] Failed to fetch payment details from MercadoPago")
        return NextResponse.json({ success: false }, { status: 400 })
      }

      const paymentData = await paymentResponse.json()
      console.log("[v0] MercadoPago payment data:", JSON.stringify(paymentData, null, 2))

      const { status, payer, metadata, external_reference } = paymentData
      const customerEmail = payer?.email
      const customerName = payer?.first_name + " " + (payer?.last_name || "")
      const productName = metadata?.product_name || "Lives Vazadas - Mensal - R$ 19,90"

      console.log("[v0] Processing MercadoPago payment:", {
        status,
        customerEmail,
        customerName,
        productName,
        external_reference,
      })

      // Verificar se o pagamento foi aprovado
      if (status === "approved") {
        console.log("[v0] MercadoPago payment approved for:", customerEmail)

        const deliverySuccess = await sendDeliveryEmail(customerEmail, productName, customerName)

        if (deliverySuccess) {
          console.log("[v0] ✅ Product delivered successfully via MercadoPago to:", customerEmail)
        } else {
          console.log("[v0] ❌ Failed to deliver product via MercadoPago to:", customerEmail)
        }
      } else {
        console.log("[v0] MercadoPago payment status is not approved:", status)
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error processing MercadoPago webhook:", error)
    return NextResponse.json({ success: false }, { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "MercadoPago Webhook endpoint is active",
    endpoint: "/api/mercadopago/webhook",
  })
}
