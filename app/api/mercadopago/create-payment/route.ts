import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const requestId = `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  try {
    const body = await request.json()
    console.log(`[v0] Creating MercadoPago payment [${requestId}]:`, body)

    const { customerName, customerEmail, customerPhone, customerDocument, amount, productName, paymentMethod } = body

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!accessToken) {
      console.error(`[v0] MercadoPago access token not configured [${requestId}]`)
      return NextResponse.json(
        {
          success: false,
          error: "MercadoPago access token not configured",
          message: "Por favor, configure a variável de ambiente MERCADOPAGO_ACCESS_TOKEN",
        },
        { status: 500 },
      )
    }

    // Configurar dados do pagamento baseado no método
    const paymentData: any = {
      transaction_amount: Number.parseFloat(amount),
      description: productName,
      payment_method_id: paymentMethod === "pix" ? "pix" : paymentMethod,
      payer: {
        email: customerEmail,
        first_name: customerName.split(" ")[0] || customerName,
        last_name: customerName.split(" ").slice(1).join(" ") || "",
        identification: customerDocument
          ? {
              type: "CPF",
              number: customerDocument.replace(/\D/g, ""),
            }
          : undefined,
        phone: customerPhone
          ? {
              area_code: customerPhone.replace(/\D/g, "").substring(0, 2),
              number: customerPhone.replace(/\D/g, "").substring(2),
            }
          : undefined,
      },
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago/webhook`,
      external_reference: `order_${requestId}`,
      metadata: {
        product_name: productName,
        customer_email: customerEmail,
      },
    }

    // Configurações específicas por método de pagamento
    if (paymentMethod === "pix") {
      paymentData.payment_method_id = "pix"
      paymentData.date_of_expiration = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
    } else if (paymentMethod === "boleto") {
      paymentData.payment_method_id = "bolbradesco"
      paymentData.date_of_expiration = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 dias
    }

    const apiUrl = "https://api.mercadopago.com/v1/payments"

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": requestId,
      },
      body: JSON.stringify(paymentData),
    })

    console.log(`[v0] MercadoPago API response status [${requestId}]:`, response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] MercadoPago API error [${requestId}]:`, errorText)

      return NextResponse.json(
        {
          success: false,
          error: "Failed to create MercadoPago payment",
          message: `Erro na API do MercadoPago: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const paymentResult = await response.json()
    console.log(`[v0] MercadoPago payment created successfully [${requestId}]:`, paymentResult)

    // Extrair dados relevantes baseado no método de pagamento
    const responseData: any = {
      success: true,
      payment_id: paymentResult.id,
      status: paymentResult.status,
      request_id: requestId,
    }

    if (paymentMethod === "pix" && paymentResult.point_of_interaction) {
      responseData.qr_code = paymentResult.point_of_interaction.transaction_data?.qr_code_base64
      responseData.pix_key = paymentResult.point_of_interaction.transaction_data?.qr_code
    } else if (paymentMethod === "boleto" && paymentResult.transaction_details) {
      responseData.boleto_url = paymentResult.transaction_details.external_resource_url
      responseData.barcode = paymentResult.transaction_details.digitable_line
    } else if (paymentMethod === "credit_card") {
      responseData.payment_url = paymentResult.init_point || paymentResult.sandbox_init_point
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error(`[v0] Error creating MercadoPago payment [${requestId}]:`, error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create payment",
        message: error instanceof Error ? error.message : "Unknown error",
        request_id: requestId,
      },
      { status: 500 },
    )
  }
}
