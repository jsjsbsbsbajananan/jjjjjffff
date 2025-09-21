import { type NextRequest, NextResponse } from "next/server"

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Don't retry on 4xx errors (client errors)
      if (error instanceof Response && error.status >= 400 && error.status < 500) {
        throw error
      }

      if (attempt === maxRetries) {
        throw lastError
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt - 1)
      console.log(`[v0] Retry attempt ${attempt}/${maxRetries} after ${delay}ms`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

function logRequest(requestId: string, url: string, headers: any, body: any) {
  const timestamp = new Date().toISOString()
  const sanitizedHeaders = { ...headers }

  // Remove sensitive data from logs
  if (sanitizedHeaders.Authorization) {
    sanitizedHeaders.Authorization = "Bearer XXXX"
  }

  console.log(`[v0] REQUEST ${requestId} at ${timestamp}:`, {
    url,
    headers: sanitizedHeaders,
    body,
    server: process.env.VERCEL_REGION || "local",
  })
}

function logResponse(requestId: string, status: number, body: any, error?: any) {
  const timestamp = new Date().toISOString()

  console.log(`[v0] RESPONSE ${requestId} at ${timestamp}:`, {
    status,
    body,
    error: error?.message,
    stack: error?.stack,
    server: process.env.VERCEL_REGION || "local",
  })
}

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  try {
    const body = await request.json()
    console.log(`[v0] Creating TriboPay payment [${requestId}]:`, body)

    const { amount, offer_hash, payment_method, installments, cart } = body

    let apiKey = process.env.TRIBOPAY_API_KEY

    if (!apiKey) {
      apiKey = "RvvwE8D5taT8UnFQXcFRl7Nv6NUzbNUVoXlb9Xfw3a4shnDM94fsRJE8Egas"
      console.log(`[v0] Using fallback API key [${requestId}]`)
    }

    if (!apiKey || apiKey === "SEU_TOKEN_AQUI") {
      console.error(`[v0] TriboPay API key not configured [${requestId}]`)
      return NextResponse.json(
        {
          success: false,
          error: "TriboPay API key not configured",
          message: "Por favor, configure a variável de ambiente TRIBOPAY_API_KEY ou atualize o token no código",
        },
        { status: 500 },
      )
    }

    const tribopayPayload = {
      amount,
      offer_hash,
      payment_method: payment_method || "pix",
      installments: installments || 1,
      cart,
      customer: {
        name: "Cliente Anônimo",
        email: "cliente@exemplo.com",
        document: "00000000000",
        document_type: "cpf",
      },
    }

    const apiUrl = `https://api.tribopay.com.br/api/public/v1/transactions?api_token=${apiKey}`

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    // Log request details (only in development)
    if (process.env.NODE_ENV === "development") {
      logRequest(requestId, apiUrl.replace(apiKey, "XXXX"), headers, tribopayPayload)
    }

    try {
      const result = await retryWithBackoff(async () => {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(tribopayPayload),
        })

        console.log(`[v0] TriboPay API response status [${requestId}]:`, response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`[v0] TriboPay API error [${requestId}]:`, errorText)

          if (
            errorText.includes("cashin.safepayments.cloud") ||
            errorText.includes("cURL error 35") ||
            errorText.includes("SSL_ERROR_SYSCALL")
          ) {
            logResponse(requestId, response.status, errorText, new Error("Provider gateway error"))

            return NextResponse.json(
              {
                success: false,
                code: "PROVIDER_GATEWAY_ERROR",
                message: "Erro interno no provedor de pagamento. Tente novamente mais tarde.",
                details: "Gateway connection failed",
              },
              { status: 502 },
            )
          }

          throw new Error(`TriboPay API error: ${response.status} - ${errorText}`)
        }

        return response
      })

      // If we got a NextResponse (error case), return it directly
      if (result instanceof NextResponse) {
        return result
      }

      const paymentData = await result.json()
      logResponse(requestId, result.status, paymentData)

      console.log(`[v0] TriboPay payment created successfully [${requestId}]:`, paymentData)

      return NextResponse.json({
        success: true,
        data: {
          hash: paymentData.hash || paymentData.id,
          payment_url: paymentData.payment_url || paymentData.checkout_url,
          qr_code: paymentData.qr_code || null,
          pix_key: paymentData.pix_key || paymentData.pix_code || null,
          barcode: paymentData.barcode || null,
          payment_id: paymentData.id,
          status: paymentData.status,
          ...paymentData, // Include all data returned by API
        },
        request_id: requestId,
      })
    } catch (apiError) {
      logResponse(requestId, 0, null, apiError)
      console.error(`[v0] Error calling TriboPay API [${requestId}]:`, apiError)

      const errorMessage = apiError instanceof Error ? apiError.message : "Unknown error"

      if (errorMessage.includes("cashin.safepayments.cloud") || errorMessage.includes("cURL error 35")) {
        return NextResponse.json(
          {
            success: false,
            code: "PROVIDER_GATEWAY_ERROR",
            message: "Erro interno no provedor de pagamento. Tente novamente mais tarde.",
            request_id: requestId,
          },
          { status: 502 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to communicate with TriboPay API",
          message: errorMessage,
          request_id: requestId,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    logResponse(requestId, 0, null, error)
    console.error(`[v0] Error creating TriboPay payment [${requestId}]:`, error)
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
