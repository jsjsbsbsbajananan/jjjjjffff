let webhookLogs: any[] = []
const accessKeys: any[] = []

export function addWebhookLog(logData: any) {
  const log = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...logData,
  }

  webhookLogs.push(log)
  console.log("[v0] Log salvo:", log.id)

  // Manter apenas os últimos 100 logs
  if (webhookLogs.length > 100) {
    webhookLogs = webhookLogs.slice(-100)
  }

  return log
}

export function getWebhookLogs() {
  return webhookLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50)
}

export function clearWebhookLogs() {
  webhookLogs = []
}

export function addAccessKey(keyData: any) {
  accessKeys.push(keyData)
  console.log("[v0] KEY salva:", keyData.key)
  return keyData
}

export function getAccessKeys() {
  return accessKeys
}

export function findAccessKey(key: string) {
  return accessKeys.find((k) => k.key === key && k.status === "active")
}

export function findAccessKeysByEmail(email: string) {
  return accessKeys.filter((k) => k.email === email)
}
