import { type NextRequest, NextResponse } from "next/server"

const PRODUCT_DELIVERY_CONFIG = {
  "Lives Vazadas - Mensal - R$ 19,90": {
    type: "digital_content",
    delivery_method: "email",
    content: {
      subject: "🎉 Seu acesso foi liberado! - Hot Flix Premium",
      message: `
Olá! 

Parabéns! Seu pagamento foi confirmado e seu acesso ao Hot Flix Premium foi liberado com sucesso! 🚀

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
      attachments: [], // Aqui você pode adicionar links para downloads, PDFs, etc.
    },
  },
  "Premium - Mensal - R$ 39,90": {
    type: "digital_content",
    delivery_method: "email",
    content: {
      subject: "🔥 Bem-vindo ao Hot Flix Premium Plus!",
      message: `
Olá!

Seu pagamento foi confirmado! Bem-vindo ao Hot Flix Premium Plus! 🌟

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

    console.log("[v0] Sending delivery email to:", customerEmail, "for product:", productName)

    // Aqui você pode integrar com um serviço de email real como:
    // - Resend, SendGrid, Mailgun, etc.
    // Por enquanto, vou simular o envio

    const emailData = {
      to: customerEmail,
      subject: config.content.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a24); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔥 Hot Flix</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Seu acesso foi liberado!</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; line-height: 1.6;">
            ${config.content.message.replace(/\n/g, "<br>")}
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #e9ecef; border-radius: 10px;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
              Este email foi enviado automaticamente após a confirmação do seu pagamento.
            </p>
          </div>
        </div>
      `,
      text: config.content.message,
    }

    // Simular envio de email (substitua por integração real)
    console.log("[v0] EMAIL SENT SIMULATION:", emailData)

    // Para integração real, descomente e configure:
    /*
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@hotflix.com',
        to: customerEmail,
        subject: emailData.subject,
        html: emailData.html,
      }),
    })
    */

    return true
  } catch (error) {
    console.error("[v0] Error sending delivery email:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON payload from TriboPay
    const payload = await request.json()

    // Log the complete payload for debugging
    console.log("[v0] TriboPay Webhook received:", JSON.stringify(payload, null, 2))

    // Extract the main fields
    const { hash, customer, payment_status, amount } = payload

    const customerEmail = customer?.email
    const customerName = customer?.name

    // Log extracted fields
    console.log("[v0] Extracted fields:", {
      hash,
      customerEmail,
      customerName,
      payment_status,
      amount,
    })

    console.log("[v0] Processing payment for:", customerEmail, "Status:", payment_status)

    // Check if payment is completed
    if (payment_status === "paid") {
      console.log("[v0] Payment confirmed as PAID for hash:", hash)

      console.log("[v0] Starting automatic delivery process...")

      const productName = payload.product_name || "Lives Vazadas - Mensal - R$ 19,90"

      // Enviar produto automaticamente
      const deliverySuccess = await sendDeliveryEmail(customerEmail, productName, customerName)

      if (deliverySuccess) {
        console.log("[v0] ✅ Product delivered successfully to:", customerEmail)
      } else {
        console.log("[v0] ❌ Failed to deliver product to:", customerEmail)
      }

      console.log("[v0] Order processed and product delivered for hash:", hash)
    } else {
      console.log("[v0] Payment status is not paid:", payment_status, "- No delivery triggered")
    }

    // Always return HTTP 200 to confirm receipt
    return NextResponse.json(
      {
        success: true,
        message: "Webhook received and processed successfully",
        hash: hash,
        status: payment_status,
        delivery_triggered: payment_status === "paid",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Error processing TriboPay webhook:", error)

    // Still return 200 to avoid webhook retries
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 200 },
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({
    message: "TriboPay Webhook endpoint is active",
    endpoint: "/api/tribopay/webhook",
  })
}
