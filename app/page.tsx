"use client"

import { Button } from "@/components/ui/button"
import { Shield, Zap, Crown, X, Play, Ruler, Eye, Users, Copy, QrCode, User } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"

export default function Page() {
  const [showModal, setShowModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [selectedPlan, setSelectedPlan] = useState("premium")
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [selectedOption, setSelectedOption] = useState("trimestral")
  const [paymentData, setPaymentData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("")

  const previewVideos = [
    {
      src: "/videos/preview-1.mp4",
      title: "Preview Exclusivo 1",
      description: "Conteúdo vazado premium",
    },
    {
      src: "/videos/preview-2.mp4",
      title: "Preview Exclusivo 2",
      description: "Novinha gostosa exclusiva",
    },
    {
      src: "/videos/preview-3.mp4",
      title: "Preview Exclusivo 3",
      description: "Conteúdo VIP limitado",
    },
  ]

  const generateQRCode = async (text) => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`
      setQrCodeDataUrl(qrUrl)
    } catch (error) {
      console.error("[v0] Error generating QR code:", error)
      setQrCodeDataUrl("")
    }
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVideoChange = (index: number) => {
    setCurrentVideoIndex(index)
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }

  const handleShowPreview = () => {
    setShowPreviewModal(true)
    setCurrentVideoIndex(0)
    setIsPlaying(false)
  }

  const testimonials = [
    {
      name: "Carlos R.",
      text: "Finalmente achei o que procurava! Conteúdos vazados exclusivos das novinhas mais gostosas. Vale cada centavo!",
      rating: 5,
    },
    {
      name: "Bruno M.",
      text: "Site incrível! Vazados exclusivos de casadas e loirinhas que não encontro em lugar nenhum. Recomendo demais!",
      rating: 5,
    },
    {
      name: "Rafael S.",
      text: "Melhor investimento que já fiz. Conteúdos vazados premium das gostosas mais safadas da internet!",
      rating: 5,
    },
  ]

  const subscriptionOptions = [
    {
      id: "trimestral",
      name: "Acesso VIP - Trimestral",
      price: "29,90",
      originalPrice: "49,90",
      period: "mês",
      popular: true,
      savings: "40% OFF",
      available: "23 disponíveis",
      amount: 2990,
      offer_hash: "ovb7ca0rkc",
      product_hash: "lbt4gtnm2k",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleSubscribe = () => {
    setShowModal(true)
  }

  const generatePixPayment = async () => {
    if (!customerName.trim()) {
      setError("Por favor, informe seu nome para continuar")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("[v0] Calling create-transaction API with name:", customerName.trim())

      const response = await fetch("/api/create-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: customerName.trim(),
        }),
      })

      const data = await response.json()
      console.log("[v0] API response received:", data)

      if (data.success) {
        console.log("[v0] Payment data:", data.data)
        setPaymentData(data.data)

        const pixCode = data.data.pix_key || data.data.pix?.pix_qr_code || data.data.pix_code
        if (pixCode) {
          await generateQRCode(pixCode)
        }

        setShowModal(false)
        setShowPaymentModal(true)
      } else {
        if (data.code === "PROVIDER_GATEWAY_ERROR") {
          setError("Estamos com instabilidade no provedor de pagamento. Tente novamente em alguns minutos.")
        } else {
          setError(data.message || "Erro ao gerar pagamento")
        }
      }
    } catch (err) {
      console.error("[v0] Error in generatePixPayment:", err)
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyPixCode = () => {
    const pixCode =
      paymentData?.pix_key || paymentData?.pix?.pix_qr_code || paymentData?.pix_code || paymentData?.barcode
    console.log("[v0] Attempting to copy PIX code:", pixCode)

    if (pixCode) {
      navigator.clipboard.writeText(pixCode)
      alert("Código PIX copiado!")
    } else {
      console.error("[v0] No PIX code found in payment data:", paymentData)
      alert("Código PIX não disponível")
    }
  }

  const openPaymentApp = () => {
    if (paymentData?.payment_url) {
      window.open(paymentData.payment_url, "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 w-full bg-black/95 backdrop-blur-md border-b border-red-500/30 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center">
                <Ruler className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-red-400">VAZADOS</h1>
                <p className="text-xs text-red-400 font-bold">CONTEÚDOS EXCLUSIVOS</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#vazados" className="text-gray-300 hover:text-red-400 transition-colors font-semibold">
                Vazados
              </a>
              <a href="#planos" className="text-gray-300 hover:text-red-400 transition-colors font-semibold">
                Planos
              </a>
              <a href="#contato" className="text-gray-300 hover:text-red-400 transition-colors font-semibold">
                Contato
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold">
                  <Crown className="w-4 h-4 mr-2" />
                  ENTRAR NO CHAT
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-pink-900/20"></div>

        <div className="absolute left-10 top-32 hidden lg:block">
          <div className="flex flex-col items-center">
            <div className="w-1 h-96 bg-gradient-to-b from-red-500 to-pink-500 rounded-full relative">
              <div className="absolute -left-8 top-0 text-red-400 text-sm font-bold">1.60m</div>
              <div className="absolute -left-8 top-20 text-yellow-400 text-sm font-bold">1.50m</div>
              <div className="absolute -left-8 top-40 text-green-400 text-sm font-bold">1.40m</div>
              <div className="absolute -left-8 top-60 text-red-400 text-sm font-bold">1.30m ❤️</div>
              <div className="absolute -left-8 top-80 text-pink-400 text-sm font-bold">1.20m 🔥</div>
            </div>
            <div className="text-red-400 text-xs mt-2 font-bold">ALTURA PERFEITA</div>
          </div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="mb-8">
            <img
              src="/images/banner-conteudinhos-vip.png"
              alt="Conteúdos VIP - Vazados Exclusivos"
              className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl border-2 border-red-500/50"
            />
          </div>

          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600/30 to-pink-600/30 px-8 py-4 rounded-full border border-red-500/50 mb-8">
            <Eye className="w-6 h-6 text-red-400" />
            <span className="text-red-300 font-bold text-lg">CONTEÚDO ADULTO +18</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-red-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
              CONTEÚDOS
            </span>
            <br />
            <span className="bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
              VAZADOS
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed font-bold">
            Os <span className="text-red-400">conteúdos vazados mais quentes</span> das{" "}
            <span className="text-pink-400">novinhas, casadas e loirinhas</span> mais gostosas da internet!
            <br />
            <span className="text-base text-gray-400">Conteúdo exclusivo que você não encontra em lugar nenhum</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/auth/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white text-lg px-12 py-6 rounded-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 font-black"
              >
                <Crown className="w-6 h-6 mr-3" />
                VER VAZADOS AGORA
              </Button>
            </Link>
            <Button
              onClick={handleShowPreview}
              variant="outline"
              size="lg"
              className="border-3 border-red-400 text-red-400 hover:bg-red-400 hover:text-black text-base px-10 py-6 rounded-2xl transition-all duration-300 transform hover:scale-105 font-bold bg-transparent"
            >
              <Play className="w-5 h-5 mr-2" />
              PREVIEW GRÁTIS
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600/30 to-pink-600/30 rounded-2xl flex items-center justify-center mb-4 border border-red-500/50">
                <Users className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-2xl font-black text-red-400 mb-2">2.847</h3>
              <p className="text-gray-400 text-sm font-bold">MEMBROS VIP</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600/30 to-pink-600/30 rounded-2xl flex items-center justify-center mb-4 border border-red-500/50">
                <Eye className="w-10 h-10 text-pink-400" />
              </div>
              <h3 className="text-2xl font-black text-pink-400 mb-2">156</h3>
              <p className="text-gray-400 text-sm font-bold">VISUALIZANDO</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600/30 to-pink-600/30 rounded-2xl flex items-center justify-center mb-4 border border-red-500/50">
                <Ruler className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-2xl font-black text-red-400 mb-2">1.50m</h3>
              <p className="text-gray-400 text-sm font-bold">ALTURA MÁXIMA</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600/30 to-pink-600/30 rounded-2xl flex items-center justify-center mb-4 border border-red-500/50">
                <Zap className="w-10 h-10 text-pink-400" />
              </div>
              <h3 className="text-2xl font-black text-pink-400 mb-2">24/7</h3>
              <p className="text-gray-400 text-sm font-bold">NOVOS VAZADOS</p>
            </div>
          </div>
        </div>
      </section>

      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl max-w-4xl w-full mx-auto shadow-2xl border border-red-500/50 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10 bg-black/50 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black text-white mb-2">🔥 PREVIEW EXCLUSIVO</h2>
                <p className="text-gray-400 text-base">Veja uma amostra do nosso conteúdo premium</p>
              </div>

              {/* Player de Vídeo */}
              <div className="relative mb-6">
                <div className="bg-black rounded-2xl overflow-hidden border-2 border-red-500/50">
                  <video
                    ref={videoRef}
                    src={previewVideos[currentVideoIndex].src}
                    className="w-full h-96 object-cover"
                    poster="/placeholder.svg?height=400&width=600"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    controls
                  />

                  {/* Overlay de Play/Pause */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {!isPlaying && (
                      <button
                        onClick={handlePlayPause}
                        className="bg-red-600/80 hover:bg-red-600 text-white rounded-full p-4 transition-all duration-300 transform hover:scale-110 pointer-events-auto"
                      >
                        <Play className="w-8 h-8" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Info do Vídeo Atual */}
                <div className="mt-4 text-center">
                  <h3 className="text-xl font-bold text-white">{previewVideos[currentVideoIndex].title}</h3>
                  <p className="text-gray-400">{previewVideos[currentVideoIndex].description}</p>
                </div>
              </div>

              {/* Seletor de Vídeos */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {previewVideos.map((video, index) => (
                  <button
                    key={index}
                    onClick={() => handleVideoChange(index)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      currentVideoIndex === index
                        ? "border-red-400 shadow-lg shadow-red-500/25"
                        : "border-gray-600 hover:border-red-400/50"
                    }`}
                  >
                    <video
                      src={video.src}
                      className="w-full h-24 object-cover"
                      poster="/placeholder.svg?height=100&width=150"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-xs font-bold truncate">{video.title}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-2xl p-6 border border-red-500/30 mb-4">
                  <h3 className="text-2xl font-black text-white mb-2">🚀 QUER VER MAIS?</h3>
                  <p className="text-gray-300 mb-4">
                    Isso é apenas uma pequena amostra! Temos centenas de vídeos exclusivos esperando por você.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/auth/login">
                      <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-black px-8 py-3 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105">
                        <Crown className="w-5 h-5 mr-2" />
                        ACESSAR CONTEÚDO COMPLETO
                      </Button>
                    </Link>
                    <Button
                      onClick={handleSubscribe}
                      variant="outline"
                      className="border-2 border-red-400 text-red-400 hover:bg-red-400 hover:text-black font-bold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 bg-transparent"
                    >
                      💳 ASSINAR AGORA
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-gray-500">⚠️ Conteúdo destinado exclusivamente a maiores de 18 anos</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <section id="planos" className="py-20 px-6 bg-gradient-to-r from-red-900/10 to-pink-900/10">
        <div className="container mx-auto max-w-md">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 rounded-3xl border-2 border-red-500/50 overflow-hidden shadow-2xl">
            <div className="relative">
              <img
                src="/images/banner-conteudinhos-vip.png"
                alt="Conteúdos Vazados VIP"
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-black border-2 border-yellow-400">
                  👑 VIP
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-black">✓ VERIFICADO</span>
              </div>
              <div className="absolute bottom-4 right-4">
                <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-black">🔥 MAIS VENDIDO</span>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-2xl font-black text-white mb-2">Vazados</h3>
                <p className="text-gray-400 text-base">
                  Conteúdos vazados exclusivos de novinhas, casadas e loirinhas +18
                </p>
              </div>

              <div className="space-y-2 mb-6">
                {["✓ Conteúdos vazados exclusivos HD/4K", "✓ Atualizações diárias", "✓ Download ilimitado"].map(
                  (feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-green-400 font-bold">✓</span>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ),
                )}
              </div>

              <Button
                onClick={handleSubscribe}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-xl font-black text-base shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                👁️ VER MAIS OPÇÕES
              </Button>
            </div>
          </div>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl max-w-md w-full mx-auto shadow-2xl border border-red-500/50 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10 bg-black/50 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative">
              <img
                src="/images/banner-conteudinhos-vip.png"
                alt="Conteúdos Vazados VIP"
                className="w-full h-56 object-cover object-center rounded-t-3xl"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-black shadow-lg border-2 border-yellow-400">
                  👑 VIP
                </span>
              </div>
              <div className="absolute top-4 right-16">
                <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg">
                  ✓ VERIFICADO
                </span>
              </div>
              <div className="absolute bottom-4 right-4">
                <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg">
                  🔥 MAIS VENDIDO
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-white mb-2">Vazados</h2>
                <p className="text-gray-400 text-base">Conteúdos vazados exclusivos premium +18</p>
              </div>

              <div className="text-center mb-4">
                <span className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-2 rounded-full text-base font-black shadow-lg">
                  👤 INFORME SEU NOME
                </span>
              </div>

              <div className="relative mb-4">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:border-red-400 focus:outline-none transition-colors"
                />
              </div>

              <div className="text-center mb-4">
                <span className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-2 rounded-full text-base font-black shadow-lg">
                  ⭐ PLANO SELECIONADO ⭐
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="relative cursor-pointer rounded-xl p-4 transition-all duration-300 border-2 transform hover:scale-105 bg-gradient-to-r from-red-600/30 to-pink-600/30 border-red-400 shadow-xl shadow-red-500/25">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs px-4 py-1 rounded-full font-black shadow-lg">
                    🔥 MAIS POPULAR 🔥
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border-2 border-red-400 bg-red-400 shadow-lg flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-white">Acesso VIP - Trimestral</h4>
                        <p className="text-green-400 text-xs font-bold">(23 disponíveis) 40% OFF</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 line-through text-sm">R$49,90</div>
                      <div className="text-2xl font-black text-red-400">R$29,90</div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={generatePixPayment}
                disabled={isLoading || !customerName.trim()}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-xl font-black text-base shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? "🔄 GERANDO PIX..." : "💳 GERAR PIX AGORA"}
              </Button>

              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-center">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="font-bold">100% Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold">Acesso Imediato</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && paymentData && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl max-w-md w-full mx-auto shadow-2xl border border-green-500/50 relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10 bg-black/50 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-xl font-black text-white mb-2">PIX Gerado com Sucesso!</h2>
              <p className="text-gray-400 mb-4 text-sm">Escaneie o QR Code ou copie o código PIX</p>

              <div className="mb-4">
                <h3 className="text-base font-bold text-white mb-3">Escaneie o QR Code:</h3>
                <div className="bg-white p-3 rounded-xl inline-block">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl || "/placeholder.svg"}
                      alt="QR Code PIX"
                      className="w-32 h-32 mx-auto"
                      onError={() => {
                        console.error("[v0] QR Code image failed to load")
                        setQrCodeDataUrl("")
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-base font-bold text-white mb-3">Ou copie a chave PIX:</h3>
                <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-3">
                  <div className="bg-black/50 p-2 rounded-lg border border-gray-700">
                    <p className="text-green-400 font-mono text-xs break-all">
                      {paymentData.pix_key ||
                        paymentData.pix?.pix_qr_code ||
                        paymentData.pix_code ||
                        paymentData.barcode ||
                        "Código sendo gerado..."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <Button
                  onClick={copyPixCode}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-black text-base shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  COPIAR CÓDIGO PIX
                </Button>

                {paymentData.payment_url && (
                  <Button
                    onClick={openPaymentApp}
                    variant="outline"
                    className="w-full border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black py-3 rounded-xl font-black text-base transition-all duration-300 transform hover:scale-105 bg-transparent"
                  >
                    📱 ABRIR NO APP
                  </Button>
                )}
              </div>

              <div className="text-center text-xs text-gray-400">
                <p>
                  Valor: <span className="text-green-400 font-bold">R$ 29,90</span>
                </p>
                <p className="mt-2">Após o pagamento, seu acesso será liberado automaticamente</p>
                <p className="mt-1 text-xs text-gray-500">Você receberá um email com as instruções de acesso</p>

                {paymentData.hash && <p className="mt-2 text-xs text-gray-500">ID: {paymentData.hash}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="py-16 px-6 bg-gradient-to-br from-gray-900 to-black border-t border-red-500/30">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center">
              <Ruler className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-red-400">CONTEÚDOS VAZADOS</h3>
              <p className="text-red-400 font-bold">Conteúdo Adulto Exclusivo +18</p>
            </div>
          </div>

          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            O melhor conteúdo adulto vazado de novinhas, casadas e loirinhas mais gostosas da internet. Acesso exclusivo
            e totalmente discreto.
          </p>

          <div className="border-t border-red-500/30 pt-8">
            <p className="text-gray-500 text-sm">
              © 2024 Conteúdos Vazados. Todos os direitos reservados.
              <br />
              <span className="text-red-400 font-bold">CONTEÚDO DESTINADO EXCLUSIVAMENTE A MAIORES DE 18 ANOS</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
