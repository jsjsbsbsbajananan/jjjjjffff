// Storage compartilhado para webhooks e access keys
export const webhookLogs: any[] = []
export const accessKeys: any[] = []

export function addWebhookLog(logData: any) {
  const log = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...logData,
  }

  webhookLogs.push(log)
  console.log("[v0] Log adicionado:", log.id)

  // Manter apenas os últimos 100 logs
  if (webhookLogs.length > 100) {
    webhookLogs.splice(0, webhookLogs.length - 100)
  }

  return log
}

export function addAccessKey(keyData: any) {
  const key = {
    id: Date.now().toString(),
    ...keyData,
  }

  accessKeys.push(key)
  console.log("[v0] KEY adicionada:", key.key)
  return key
}

export function clearWebhookLogs() {
  webhookLogs.length = 0
  console.log("[v0] Webhook logs cleared")
}
