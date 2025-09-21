import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"

const AMPLOPAY_BASE_URL = "https://app.amplopay.com/api/v1"
const PUBLIC_KEY = "gustavoo4544_tyxnzdtf39m9r1as"
const SECRET_KEY = "sphg5g1c6po8kfn04qgk2530s5dmnmv5d1obqpzchncidi6jh3qilozece9keudf"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, description, customer, product_id } = body

    // Create payment with AmpoPay
    const paymentData = {
      amount: amount,
      description: description,
      customer: {
        name: customer.name,
        email: customer.email,
        document: customer.document || "",
      },
      product_id: product_id,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/amplopay/webhook`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`,
    }

    const response = await axios.post(`${AMPLOPAY_BASE_URL}/payments`, paymentData, {
      headers: {
        "x-public-key": PUBLIC_KEY,
        "x-secret-key": SECRET_KEY,
        "Content-Type": "application/json",
      },
    })

    return NextResponse.json({
      success: true,
      payment_id: response.data.id,
      payment_url: response.data.payment_url,
      qr_code: response.data.qr_code,
      pix_key: response.data.pix_key,
      status: response.data.status,
    })
  } catch (error: any) {
    console.error("AmpoPay payment error:", error.response?.data || error.message)

    return NextResponse.json(
      {
        success: false,
        error: error.response?.data?.message || "Erro ao processar pagamento",
      },
      { status: 400 },
    )
  }
}
