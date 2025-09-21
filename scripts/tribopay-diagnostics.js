// TriboPay Diagnostic Script
// Run this script to collect diagnostic information for TriboPay support

const TRIBOPAY_API_KEY = process.env.TRIBOPAY_API_KEY || "YOUR_API_KEY_HERE"

const diagnosticPayload = {
  amount: 2990,
  offer_hash: "eb6ulnyxby",
  payment_method: "pix",
  installments: 1,
  cart: [
    {
      product_hash: "bsqpr2yfap",
      title: "Trimestral",
      price: 2990,
      quantity: 1,
      operation_type: 1,
      tangible: false,
    },
  ],
}

async function runDiagnostics() {
  const timestamp = new Date().toISOString()
  console.log(`\n=== TriboPay Diagnostics - ${timestamp} ===\n`)

  // 1. Test TriboPay API call
  console.log("1. Testing TriboPay API call...")
  try {
    const response = await fetch(
      `https://api.tribopay.com.br/api/public/v1/transactions?api_token=${TRIBOPAY_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(diagnosticPayload),
      },
    )

    console.log("Response Status:", response.status)
    console.log("Response Headers:", Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log("Response Body:", responseText)

    if (responseText.includes("cashin.safepayments.cloud") || responseText.includes("cURL error 35")) {
      console.log("\n❌ CONFIRMED: Provider gateway error detected!")
      console.log("This confirms the issue is on TriboPay's side with cashin.safepayments.cloud connectivity.")
    }
  } catch (error) {
    console.error("API Call Error:", error.message)
  }

  // 2. System information
  console.log("\n2. System Information:")
  console.log("Node.js Version:", process.version)
  console.log("Platform:", process.platform)
  console.log("Architecture:", process.arch)
  console.log("Environment:", process.env.NODE_ENV || "development")
  console.log("Vercel Region:", process.env.VERCEL_REGION || "local")

  // 3. Generate support ticket content
  console.log("\n3. Support Ticket Content for TriboPay:")
  console.log("=====================================")

  const ticketContent = `
Assunto: [Urgente] Falha interna: TriboPay retorna erro ao conectar com cashin.safepayments.cloud (cURL error 35)

Olá equipe TriboPay,

Estamos criando transações via POST https://api.tribopay.com.br/api/public/v1/transactions com nosso api_token. O payload enviado está validado e aceito pela API, porém a resposta é:

{"success":false,"message":"Ocorreu um erro ao processar o pagamento. Tente novamente mais tarde.","error":"cURL error 35: OpenSSL SSL_connect: SSL_ERROR_SYSCALL in connection to cashin.safepayments.cloud:443"}

Detalhes:
- payload (JSON): ${JSON.stringify(diagnosticPayload, null, 2)}
- horário UTC da requisição: ${timestamp}
- servidor/ambiente: ${process.env.VERCEL_REGION || "local"}, Node.js ${process.version}

Pedimos que verifiquem com prioridade a conectividade entre seus servidores e o gateway cashin.safepayments.cloud:443 — há um erro TLS/SSL (cURL error 35 / SSL_ERROR_SYSCALL). 

Por favor informem:
- se há instabilidade ou manutenção em andamento no gateway;
- se há requisitos TLS (ciphers/profile) específicos que nosso servidor precise suportar;
- se há IPs ou blocos a liberar no nosso firewall para que a conexão ocorra normalmente.

Aguardo retorno com orientação e prazo estimado para resolução.

Atenciosamente,
Equipe de Desenvolvimento
  `

  console.log(ticketContent)
  console.log("=====================================")

  console.log("\n4. Next Steps:")
  console.log("- Copy the support ticket content above")
  console.log("- Send it to TriboPay support")
  console.log("- Include this diagnostic output as attachment")
  console.log("- Monitor logs for request_id to track specific failed transactions")
}

// Run diagnostics
runDiagnostics().catch(console.error)
