"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Users,
  MessageCircle,
  ImageIcon,
  Video,
  Pin,
  Ruler,
  Search,
  MoreVertical,
  Download,
  Clock,
  Shield,
  Home,
  LogOut,
  ArrowLeft,
  Menu,
} from "lucide-react"
import Link from "next/link"
import { checkUserSession, logout } from "@/lib/auth"

interface Group {
  id: string
  name: string
  description: string
  image_url: string
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  content: string
  message_type: string
  file_url: string | null
  is_pinned: boolean
  created_at: string
  created_by: string
}

export default function ChatPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [keyType, setKeyType] = useState("")
  const [showSidebar, setShowSidebar] = useState(false)
  const router = useRouter()

  const fetchGroups = async () => {
    try {
      console.log("[v0] Chat: Buscando grupos...")
      const response = await fetch("/api/chats")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Chat: Grupos recebidos:", data?.length || 0)

        const groupsArray = Array.isArray(data) ? data : []
        setGroups(groupsArray)

        if (groupsArray.length > 0 && !selectedGroup) {
          setSelectedGroup(groupsArray[0])
          fetchMessages(groupsArray[0].id)
        }
      } else {
        console.error("[v0] Chat: Falha ao buscar grupos:", response.status)
        setGroups([])
      }
    } catch (error) {
      console.error("[v0] Chat: Erro ao buscar grupos:", error)
      setGroups([])
    }
  }

  const fetchMessages = async (groupId: string) => {
    try {
      setLoadingMessages(true)
      const response = await fetch(`/api/chats/${groupId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.reverse()) // Reverse to show newest first
      } else {
        console.error("Failed to fetch messages")
        setMessages([])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[v0] Chat: Verificando autenticação...")
        const { isAuthenticated } = await checkUserSession()

        if (!isAuthenticated) {
          console.log("[v0] Chat: Usuário não autenticado, redirecionando...")
          router.push("/auth/login")
          return
        }

        console.log("[v0] Chat: Usuário autenticado")
        setIsAuthenticated(true)

        if (typeof window !== "undefined") {
          setUserEmail(localStorage.getItem("userEmail") || "")
          setKeyType(localStorage.getItem("userKeyType") || "")
        }

        await fetchGroups()
      } catch (error) {
        console.error("[v0] Chat: Erro na verificação de auth:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      })
    }
  }

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Ruler className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Verificando acesso VIP...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowSidebar(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed md:relative inset-y-0 left-0 z-50 w-80 bg-gray-900 border-r border-gray-700 flex flex-col transform transition-transform duration-300 ease-in-out
        ${showSidebar ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center">
                <Ruler className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-red-400">BAIXINHAS VIP</h1>
                <p className="text-xs text-gray-400">Chat Liberado</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400 p-1">
                  <Home className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400 p-1" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-400 p-1 md:hidden"
                onClick={() => setShowSidebar(false)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-white">Acesso Autorizado</span>
            </div>
            <p className="text-xs text-gray-400">Plano: {keyType}</p>
            <p className="text-xs text-gray-400 truncate">Email: {userEmail}</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:border-red-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => {
                  setSelectedGroup(group)
                  fetchMessages(group.id)
                  setShowSidebar(false)
                }}
                className={`w-full p-3 rounded-xl text-left transition-all duration-200 ${
                  selectedGroup?.id === group.id
                    ? "bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30"
                    : "bg-gray-800/50 hover:bg-gray-700/50 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={group.image_url || "/placeholder.svg?height=40&width=40"}
                    alt={group.name}
                    className="w-10 h-10 rounded-full bg-gray-700 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{group.name}</h3>
                    <p className="text-xs text-gray-400 truncate">{group.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white p-1 md:hidden"
                    onClick={() => setShowSidebar(true)}
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                  <img
                    src={selectedGroup.image_url || "/placeholder.svg?height=40&width=40"}
                    alt={selectedGroup.name}
                    className="w-12 h-12 rounded-full bg-gray-700 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-white truncate">{selectedGroup.name}</h2>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <p className="text-gray-400 text-sm truncate">{selectedGroup.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-black to-gray-900">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
                  <span className="ml-2 text-gray-400">Carregando mensagens...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Nenhuma mensagem ainda neste grupo.</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={message.id} className="flex flex-col">
                    <div className="flex items-start space-x-3">
                      <img
                        src={selectedGroup.image_url || "/placeholder.svg?height=32&width=32"}
                        alt="Admin"
                        className="w-8 h-8 rounded-full bg-gray-700 object-cover mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-800 rounded-2xl rounded-tl-md p-4 shadow-lg">
                          {message.is_pinned && (
                            <div className="flex items-center gap-2 mb-3 p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                              <Pin className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                              <span className="text-sm font-semibold text-yellow-400">Mensagem Fixada</span>
                            </div>
                          )}

                          {message.message_type === "text" && (
                            <p className="text-white leading-relaxed">{message.content}</p>
                          )}

                          {message.message_type === "image" && (
                            <div>
                              {message.content && <p className="text-white mb-3 leading-relaxed">{message.content}</p>}
                              <div className="relative group">
                                <img
                                  src={message.file_url || "/placeholder.svg?height=300&width=400"}
                                  alt="Imagem exclusiva"
                                  className="rounded-lg w-full max-w-sm cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                                  onError={(e) => {
                                    console.log("[v0] Erro ao carregar imagem:", message.file_url)
                                    e.target.src = "/placeholder.svg?height=300&width=400&text=Imagem+não+encontrada"
                                  }}
                                  onLoad={() => {
                                    console.log("[v0] Imagem carregada com sucesso:", message.file_url)
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <Button size="sm" className="bg-black/50 hover:bg-black/70">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {message.message_type === "video" && (
                            <div>
                              {message.content && <p className="text-white mb-3 leading-relaxed">{message.content}</p>}
                              <video
                                src={message.file_url || undefined}
                                controls
                                className="rounded-lg w-full max-w-sm shadow-lg"
                                poster="/placeholder.svg?height=200&width=300"
                                onError={(e) => {
                                  console.log("[v0] Erro ao carregar vídeo:", message.file_url)
                                }}
                                onLoadedData={() => {
                                  console.log("[v0] Vídeo carregado com sucesso:", message.file_url)
                                }}
                              >
                                Seu navegador não suporta vídeos.
                              </video>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700">
                            <div className="flex items-center gap-2 text-gray-400">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">{formatTime(message.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                              {message.message_type === "image" && <ImageIcon className="w-4 h-4" />}
                              {message.message_type === "video" && <Video className="w-4 h-4" />}
                              {message.message_type === "text" && <MessageCircle className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700 bg-gray-900">
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-4 text-center border border-gray-600">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  <span className="font-semibold text-white">Modo Visualização</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Você está no modo somente leitura. Aproveite o conteúdo exclusivo!
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-black to-gray-900 p-4">
            <div className="text-center max-w-md">
              <Button
                variant="ghost"
                size="lg"
                className="w-24 h-24 bg-gradient-to-br from-red-600/20 to-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30 hover:from-red-600/30 hover:to-pink-600/30 md:hidden"
                onClick={() => setShowSidebar(true)}
              >
                <Users className="w-12 h-12 text-red-400" />
              </Button>
              <div className="w-24 h-24 bg-gradient-to-br from-red-600/20 to-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30 hidden md:flex">
                <Users className="w-12 h-12 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Bem-vindo ao Chat!</h2>
              <p className="text-gray-400 mb-4">Selecione um grupo para acessar o conteúdo exclusivo</p>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-300">🔥 {groups.length} grupos disponíveis</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
