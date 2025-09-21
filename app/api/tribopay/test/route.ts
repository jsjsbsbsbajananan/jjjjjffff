export async function GET() {
  console.log("[v0] TEST ENDPOINT - GET request received")
  return Response.json({
    status: "success",
    message: "Webhook endpoint is accessible",
    timestamp: new Date().toISOString(),
  })
}

export async function POST() {
  console.log("[v0] TEST ENDPOINT - POST request received")
  return Response.json({
    status: "success",
    message: "Webhook endpoint can receive POST requests",
    timestamp: new Date().toISOString(),
  })
}
