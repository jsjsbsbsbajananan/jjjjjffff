"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { ArrowLeft, CreditCard, Smartphone, FileText, Check, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    document: "",
    phone: "",
  })
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "pix" | "boleto">("pix")
  const [paymentProvider, setPaymentProvider] = useState<"tribopay" | "mercadopago">("tribopay")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<any>(null)

  useEffect(() => {
    // Get product data from localStorage
    const productData = localStorage.getItem("selectedProduct")
    if (productData) {
      setSelectedProduct(JSON.parse(productData))
    } else {
      router.push("/")
    }
  }, [router])

  const handlePayment = async () => {
    if (!selectedProduct || !customerData.name || !customerData.email) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    setIsProcessing(true)

    try {
      const apiEndpoint =
        paymentProvider === "mercadopago" ? "/api/mercadopago/create-payment" : "/api/tribopay/create-payment"

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: customerData.name,
          customerEmail: customerData.email,
          customerPhone: customerData.phone || "",
          customerDocument: customerData.document || "",
          amount: selectedProduct.price,
          productName: selectedProduct.name,
          paymentMethod: paymentMethod,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setPaymentResult(result)
      } else {
        if (result.code === "PROVIDER_GATEWAY_ERROR") {
          alert("Estamos com instabilidade no provedor de pagamento. Tente novamente em alguns minutos.")
        } else {
          alert("Erro ao processar pagamento: " + result.message || result.error)
        }
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("Erro ao processar pagamento. Tente novamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-400 mx-auto mb-4" />
          <p className="text-red-300">Carregando...</p>
        </div>
      </div>
    )
  }

  if (paymentResult) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 text-center border border-red-500/30">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">Pagamento Criado!</h2>

          {paymentMethod === "pix" && paymentResult.qr_code && (
            <div className="mb-6">
              <p className="text-red-300 mb-4">Escaneie o QR Code para pagar:</p>
              <div className="bg-white p-4 rounded-xl mx-auto inline-block">
                <img src={paymentResult.qr_code || "/placeholder.svg"} alt="QR Code PIX" className="w-48 h-48" />
              </div>
              {paymentResult.pix_key && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Ou use a chave PIX:</p>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <code className="text-green-400 text-sm break-all">{paymentResult.pix_key}</code>
                  </div>
                </div>
              )}
            </div>
          )}

          {paymentMethod === "boleto" && paymentResult.boleto_url && (
            <div className="mb-6">
              <p className="text-red-300 mb-4">Boleto gerado com sucesso!</p>
              <Button
                onClick={() => window.open(paymentResult.boleto_url, "_blank")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Visualizar Boleto
              </Button>
            </div>
          )}

          <div className="text-left bg-gray-800/50 rounded-xl p-4 mb-6">
            <h3 className="text-white font-semibold mb-2">Detalhes do Pedido:</h3>
            <p className="text-gray-300">{selectedProduct.name}</p>
            <p className="text-green-400 font-bold">R$ {selectedProduct.price}</p>
          </div>

          <Button onClick={() => router.push("/")} className="w-full bg-red-600 hover:bg-red-700">
            Voltar ao Início
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="bg-transparent border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-white">Finalizar Compra</h1>
          </div>

          {/* Product Summary */}
          <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-red-500/30">
            <h2 className="text-xl font-semibold text-white mb-4">Resumo do Pedido</h2>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-300">{selectedProduct.name}</p>
                <p className="text-sm text-gray-400">Acesso Premium</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">R$ {selectedProduct.price}</p>
                <p className="text-sm text-gray-400">À vista no PIX</p>
              </div>
            </div>
          </div>

          {/* Customer Data */}
          <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-red-500/30">
            <h2 className="text-xl font-semibold text-white mb-4">Seus Dados</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo *</label>
                <input
                  type="text"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
                  placeholder="Digite seu nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">E-mail *</label>
                <input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
                  placeholder="Digite seu e-mail"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">CPF (opcional)</label>
                <input
                  type="text"
                  value={customerData.document}
                  onChange={(e) => setCustomerData({ ...customerData, document: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Telefone (opcional)</label>
                <input
                  type="text"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          {/* Payment Provider Selection */}
          <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-red-500/30">
            <h2 className="text-xl font-semibold text-white mb-4">Provedor de Pagamento</h2>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentProvider("tribopay")}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  paymentProvider === "tribopay"
                    ? "border-red-500 bg-red-500/10"
                    : "border-gray-600 bg-gray-800 hover:border-gray-500"
                }`}
              >
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">TriboPay</p>
                  <p className="text-sm text-gray-200">Processamento rápido</p>
                </div>
                <div className="ml-auto">
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">Padrão</span>
                </div>
              </button>

              <button
                onClick={() => setPaymentProvider("mercadopago")}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  paymentProvider === "mercadopago"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-600 bg-gray-800 hover:border-gray-500"
                }`}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MP</span>
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Mercado Pago</p>
                  <p className="text-sm text-gray-200">Segurança e confiabilidade</p>
                </div>
                <div className="ml-auto">
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Novo</span>
                </div>
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-red-500/30">
            <h2 className="text-xl font-semibold text-white mb-4">Forma de Pagamento</h2>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod("pix")}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === "pix"
                    ? "border-green-500 bg-green-500/10"
                    : "border-gray-600 bg-gray-800 hover:border-gray-500"
                }`}
              >
                <Smartphone className="w-5 h-5 text-green-400" />
                <div className="text-left">
                  <p className="text-white font-medium">PIX</p>
                  <p className="text-sm text-gray-200">Aprovação instantânea</p>
                </div>
                <div className="ml-auto">
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Recomendado</span>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod("boleto")}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === "boleto"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-600 bg-gray-800 hover:border-gray-500"
                }`}
              >
                <FileText className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-white font-medium">Boleto Bancário</p>
                  <p className="text-sm text-gray-200">Vencimento em 3 dias úteis</p>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod("credit_card")}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === "credit_card"
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-gray-600 bg-gray-800 hover:border-gray-500"
                }`}
              >
                <CreditCard className="w-5 h-5 text-purple-400" />
                <div className="text-left">
                  <p className="text-white font-medium">Cartão de Crédito</p>
                  <p className="text-sm text-gray-200">Parcelamento disponível</p>
                </div>
              </button>
            </div>
          </div>

          {/* Finalize Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full font-bold py-4 text-lg rounded-xl shadow-xl ${
              paymentProvider === "mercadopago"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            } text-white`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>Finalizar Pagamento - R$ {selectedProduct.price}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
