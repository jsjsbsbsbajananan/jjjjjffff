import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[v0] AmpoPay webhook received:", body)

    // Extract data from AmpoPay webhook structure
    const { event, token, offerCode, client, transaction, subscription, orderItems, trackProps } = body

    // Validate webhook token if needed
    if (!token) {
      console.error("[v0] Missing webhook token")
      return NextResponse.json({ error: "Invalid webhook" }, { status: 400 })
    }

    // Handle different events
    switch (event) {
      case "TRANSACTION_PAID":
        console.log(`[v0] Transaction ${transaction.id} paid for ${client.email}`)
        console.log(`[v0] Payment method: ${transaction.paymentMethod}`)
        console.log(`[v0] Amount: ${transaction.currency} ${transaction.amount}`)

        // If PIX payment, log PIX information
        if (transaction.pixInformation) {
          console.log(`[v0] PIX EndToEndId: ${transaction.pixInformation.endToEndId}`)
        }

        // Process order items
        if (orderItems && orderItems.length > 0) {
          orderItems.forEach((item) => {
            console.log(`[v0] Product purchased: ${item.product.name} - Price: ${item.price}`)
          })
        }

        // Here you would activate the user's subscription based on the products
        // Example: activateUserSubscription(client.id, orderItems)
        break

      case "TRANSACTION_CANCELLED":
        console.log(`[v0] Transaction ${transaction.id} cancelled`)
        break

      case "TRANSACTION_FAILED":
        console.log(`[v0] Transaction ${transaction.id} failed`)
        break

      case "SUBSCRIPTION_CREATED":
        console.log(`[v0] Subscription ${subscription?.id} created for ${client.email}`)
        break

      case "SUBSCRIPTION_CANCELLED":
        console.log(`[v0] Subscription ${subscription?.id} cancelled`)
        break

      default:
        console.log(`[v0] Unknown event: ${event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 })
  }
}
