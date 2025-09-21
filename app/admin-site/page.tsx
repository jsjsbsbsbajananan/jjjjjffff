"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Key,
  Settings,
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  Save,
  Copy,
  Check,
  Eye,
  Send,
  ImageIcon,
  Video,
  Pin,
  RotateCcw,
  MessageCircle,
  ShoppingCart,
  UserX,
  Activity,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function AdminPanel() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [selectedChat, setSelectedChat] = useState(null)
  const [purchaseUserEmail, setPurchaseUserEmail] = useState("")
  const [purchaseKeyType, setPurchaseKeyType] = useState("1 mês")

  const [editingChat, setEditingChat] = useState(null)
  const [newChatName, setNewChatName] = useState("")
  const [newChatDescription, setNewChatDescription] = useState("")
  const [newChatImage, setNewChatImage] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [messageType, setMessageType] = useState("text")
  const [copiedKey, setCopiedKey] = useState("")
  const fileInputRef = useRef(null)

  const [fileUrl, setFileUrl] = useState("")

  const [stats, setStats] = useState({
    totalVisits: 15420,
    totalSales: 89,
    totalRevenue: 12450,
    onlineUsers: 23,
    activeKeys: 45,
    expiredKeys: 12,
  })

  const [users, setUsers] = useState([
    {
      id: 1,
      email: "user123@email.com",
      keyUsed: "VIP-ABCD-1234-EFGH",
      keyType: "1 mês",
      startDate: "2024-11-15",
      expiryDate: "2024-12-15",
      status: "Ativo",
      lastAccess: "2024-11-20 14:30",
    },
    {
      id: 2,
      email: "user456@email.com",
      keyUsed: "VIP-WXYZ-5678-IJKL",
      keyType: "3 meses",
      startDate: "2024-10-01",
      expiryDate: "2025-01-01",
      status: "Ativo",
      lastAccess: "2024-11-20 12:15",
    },
  ])

  const [keys, setKeys] = useState([
    {
      id: 1,
      key: "VIP-ABCD-1234-EFGH",
      type: "1 mês",
      status: "Ativo",
      createdAt: "2024-11-15",
      expiryDate: "2024-12-15",
      userEmail: "user123@email.com",
      daysRemaining: 25,
    },
    {
      id: 2,
      key: "VIP-WXYZ-5678-IJKL",
      type: "3 meses",
      status: "Ativo",
      createdAt: "2024-10-01",
      expiryDate: "2025-01-01",
      userEmail: "user456@email.com",
      daysRemaining: 45,
    },
  ])

  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchChats = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching chats...")
      const response = await fetch("/api/chats")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Chats data received:", data)
        // Ensure we always set an array
        const chatsArray = Array.isArray(data) ? data : []
        setChats(chatsArray)
        console.log("[v0] Chats state set to:", chatsArray)
      } else {
        console.log("[v0] Failed to fetch chats, setting empty array")
        setChats([])
      }
    } catch (error) {
      console.error("[v0] Error fetching chats:", error)
      setChats([])
    } finally {
      setLoading(false)
    }
  }

  const createChat = async () => {
    if (!newChatName || !newChatDescription) {
      alert("Preencha todos os campos!")
      return
    }

    try {
      console.log("[v0] Criando chat com dados:", {
        name: newChatName,
        description: newChatDescription,
        image_url: newChatImage || "/images/chat-group.png",
      })

      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newChatName,
          description: newChatDescription,
          image_url: newChatImage || "/images/chat-group.png",
        }),
      })

      console.log("[v0] Resposta da API:", response.status, response.statusText)

      if (response.ok) {
        const newChat = await response.json()
        console.log("[v0] Chat criado com sucesso:", newChat)

        const currentChats = Array.isArray(chats) ? chats : []
        setChats([...currentChats, { ...newChat, messages: 0, members: 0, lastActivity: "Agora" }])
        setNewChatName("")
        setNewChatDescription("")
        setNewChatImage("")
        setEditingChat(null)
        alert("Chat criado com sucesso!")
      } else {
        const errorData = await response.text()
        console.error("[v0] Erro na resposta:", errorData)
        alert(`Erro ao criar chat: ${response.status} - ${errorData}`)
      }
    } catch (error) {
      console.error("[v0] Erro ao criar chat:", error)
      alert("Erro ao conectar com o servidor!")
    }
  }

  const updateChat = async (chatId, updatedData) => {
    try {
      console.log("[v0] Atualizando chat:", chatId, updatedData)

      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        const updatedChat = await response.json()
        console.log("[v0] Chat atualizado:", updatedChat)

        const currentChats = Array.isArray(chats) ? chats : []
        setChats(
          currentChats.map((chat) =>
            chat.id === chatId ? { ...updatedChat, messages: chat.messages, members: chat.members } : chat,
          ),
        )
        setEditingChat(null)
        alert("Chat atualizado com sucesso!")
      } else {
        const errorData = await response.text()
        console.error("[v0] Erro ao atualizar:", errorData)
        alert(`Erro ao atualizar chat: ${response.status}`)
      }
    } catch (error) {
      console.error("[v0] Erro ao atualizar chat:", error)
      alert("Erro ao conectar com o servidor!")
    }
  }

  const deleteChat = async (chatId) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setChats((prevChats) => (prevChats || []).filter((c) => c.id !== chatId))
        if (selectedChat?.id === chatId) {
          setSelectedChat(null)
        }
        alert("Chat excluído com sucesso!")
      } else {
        alert("Erro ao excluir chat!")
      }
    } catch (error) {
      console.error("Error deleting chat:", error)
      alert("Erro ao conectar com o servidor!")
    }
  }

  const sendMessage = async () => {
    if (!selectedChat) return

    if (messageType === "text" && !newMessage.trim()) {
      alert("Digite uma mensagem!")
      return
    }

    if ((messageType === "image" || messageType === "video") && !fileUrl.trim()) {
      alert("Digite a URL do arquivo!")
      return
    }

    try {
      const response = await fetch(`/api/chats/${selectedChat.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content:
            newMessage ||
            `${messageType === "image" ? "Foto" : messageType === "video" ? "Vídeo" : "Mensagem"} enviado`,
          message_type: messageType,
          file_url: messageType === "text" ? null : fileUrl,
          is_pinned: false,
        }),
      })

      if (response.ok) {
        const newMsg = await response.json()

        const updatedChat = {
          ...selectedChat,
          recentMessages: [
            ...(selectedChat.recentMessages || []),
            {
              id: newMsg.id,
              text: newMsg.content,
              type: newMsg.message_type,
              pinned: newMsg.is_pinned,
              timestamp: new Date(newMsg.created_at).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ],
          messages: (selectedChat.messages || 0) + 1,
        }

        setSelectedChat(updatedChat)
        setChats(chats.map((chat) => (chat.id === selectedChat.id ? updatedChat : chat)))
        setNewMessage("")
        setFileUrl("")

        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        alert("Mensagem enviada com sucesso!")
      } else {
        alert("Erro ao enviar mensagem!")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Erro ao conectar com o servidor!")
    }
  }

  const fetchChatMessages = async (chatId) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`)
      if (response.ok) {
        const messages = await response.json()
        const recentMessages = messages.slice(0, 5).map((msg) => ({
          id: msg.id,
          text: msg.content,
          type: msg.message_type,
          pinned: msg.is_pinned,
          timestamp: new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        }))

        const chat = (chats || []).find((c) => c.id === chatId)
        if (chat) {
          setSelectedChat({ ...chat, recentMessages })
        }
      }
    } catch (error) {
      console.error("Error fetching chat messages:", error)
    }
  }

  const handleChatSelection = (chat) => {
    setSelectedChat(chat)
    fetchChatMessages(chat.id)
  }

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated")
    localStorage.removeItem("adminLoginTime")
    document.cookie = "adminAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/admin-site/login")
  }

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem("adminAuthenticated") === "true"
      const loginTime = localStorage.getItem("adminLoginTime")

      if (!isAuth || !loginTime) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      const now = new Date().getTime()
      const login = new Date(loginTime).getTime()
      const hoursDiff = (now - login) / (1000 * 60 * 60)

      if (hoursDiff > 24) {
        localStorage.removeItem("adminAuthenticated")
        localStorage.removeItem("adminLoginTime")
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      setIsAuthenticated(true)
      setIsLoading(false)
    }

    checkAuth()
    fetchChats()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const renderChats = () => {
    const safeChats = Array.isArray(chats) ? chats : []
    console.log("[v0] Rendering chats, safeChats:", safeChats)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-foreground">Gerenciar Chats</h2>
            <p className="text-muted-foreground mt-2">Crie, edite e gerencie os grupos de chat</p>
          </div>
          <Button onClick={() => setEditingChat("new")} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Chat
          </Button>
        </div>

        {selectedChat && (
          <Card className="border-accent/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedChat.image_url || "/placeholder.svg"}
                    alt={selectedChat.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <CardTitle className="text-accent">💬 {selectedChat.name}</CardTitle>
                    <CardDescription>Enviar mensagens para o grupo</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedChat(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mensagens Recentes */}
              <div className="bg-muted/50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <h4 className="font-semibold mb-3 text-foreground">Mensagens Recentes:</h4>
                {selectedChat.recentMessages && selectedChat.recentMessages.length > 0 ? (
                  <div className="space-y-2">
                    {selectedChat.recentMessages.map((msg, index) => (
                      <div key={msg.id || index} className="bg-background rounded p-3 border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {msg.type === "image" && <ImageIcon className="w-4 h-4 text-blue-500" />}
                            {msg.type === "video" && <Video className="w-4 h-4 text-purple-500" />}
                            {msg.type === "text" && <MessageCircle className="w-4 h-4 text-green-500" />}
                            <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                          </div>
                          {msg.pinned && <Pin className="w-4 h-4 text-yellow-500" />}
                        </div>
                        <p className="text-sm text-foreground">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Nenhuma mensagem ainda</p>
                )}
              </div>

              {/* Tipo de Mensagem */}
              <div>
                <Label>Tipo de Mensagem</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={messageType === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMessageType("text")}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Texto
                  </Button>
                  <Button
                    variant={messageType === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMessageType("image")}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Imagem
                  </Button>
                  <Button
                    variant={messageType === "video" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMessageType("video")}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Vídeo
                  </Button>
                </div>
              </div>

              {/* Campo de Mensagem */}
              <div>
                <Label>Mensagem</Label>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={
                    messageType === "text"
                      ? "Digite sua mensagem..."
                      : `Descrição para ${messageType === "image" ? "imagem" : "vídeo"} (opcional)`
                  }
                  rows={3}
                />
              </div>

              {(messageType === "image" || messageType === "video") && (
                <div className="space-y-2">
                  <Label>URL do {messageType === "image" ? "Imagem" : "Vídeo"}</Label>
                  <Input
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder={`https://exemplo.com/${messageType === "image" ? "imagem.jpg" : "video.mp4"}`}
                  />
                  {fileUrl && messageType === "image" && (
                    <div className="mt-2">
                      <img
                        src={fileUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="w-32 h-32 rounded-lg object-cover border"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=128&width=128"
                        }}
                      />
                    </div>
                  )}
                  {fileUrl && messageType === "video" && (
                    <div className="mt-2">
                      <video
                        src={fileUrl}
                        className="w-32 h-24 rounded-lg object-cover border"
                        controls
                        onError={(e) => {
                          console.log("Erro ao carregar vídeo:", e)
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={sendMessage} className="bg-green-600 hover:bg-green-700">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Mensagem
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewMessage("")
                    setMessageType("text")
                    setFileUrl("")
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""
                    }
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {editingChat === "new" && (
          <Card className="border-accent/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-accent">Criar Novo Chat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome do Chat</Label>
                <Input
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder="Digite o nome do chat"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={newChatDescription}
                  onChange={(e) => setNewChatDescription(e.target.value)}
                  placeholder="Descreva o propósito do chat"
                />
              </div>
              <div>
                <Label>URL da Imagem (opcional)</Label>
                <Input
                  value={newChatImage}
                  onChange={(e) => setNewChatImage(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg ou /images/foto.png"
                />
                {newChatImage && (
                  <div className="mt-2">
                    <img
                      src={newChatImage || "/placeholder.svg"}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=64&width=64"
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button onClick={createChat}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingChat(null)
                    setNewChatName("")
                    setNewChatDescription("")
                    setNewChatImage("")
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {editingChat && editingChat !== "new" && (
          <Card className="border-accent/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-accent">Editar Chat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome do Chat</Label>
                <Input
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder="Digite o nome do chat"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={newChatDescription}
                  onChange={(e) => setNewChatDescription(e.target.value)}
                  placeholder="Descreva o propósito do chat"
                />
              </div>
              <div>
                <Label>URL da Imagem</Label>
                <Input
                  value={newChatImage}
                  onChange={(e) => setNewChatImage(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg ou /images/foto.png"
                />
                {newChatImage && (
                  <div className="mt-2">
                    <img
                      src={newChatImage || "/placeholder.svg"}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=64&width=64"
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() =>
                    updateChat(editingChat, {
                      name: newChatName,
                      description: newChatDescription,
                      image_url: newChatImage,
                    })
                  }
                >
                  <Save className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingChat(null)
                    setNewChatName("")
                    setNewChatDescription("")
                    setNewChatImage("")
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p>Carregando chats...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {safeChats.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">Nenhum chat encontrado. Crie o primeiro chat!</p>
              </div>
            ) : (
              safeChats.map((chat) => (
                <Card key={chat.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={chat.image_url || "/placeholder.svg"}
                          alt={chat.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <CardTitle className="text-foreground">{chat.name}</CardTitle>
                          <CardDescription>{chat.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={selectedChat?.id === chat.id ? "default" : "outline"}
                          onClick={() => handleChatSelection(chat)}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const chatItem = safeChats.find((c) => c.id === chat.id)
                            if (chatItem) {
                              setNewChatName(chatItem.name)
                              setNewChatDescription(chatItem.description)
                              setNewChatImage(chatItem.image_url || "")
                              setEditingChat(chatItem.id)
                            }
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteChat(chat.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{chat.members || 0}</p>
                        <p className="text-xs text-muted-foreground">Membros</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-accent">{chat.messages || 0}</p>
                        <p className="text-xs text-muted-foreground">Mensagens</p>
                      </div>
                      <div>
                        <Badge variant="secondary">{chat.lastActivity || "Nunca"}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  const renderKeys = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-foreground">Sistema de Keys</h2>
          <p className="text-muted-foreground mt-2">Gerencie keys de acesso e simule compras automáticas</p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-green-900 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-green-600" />
            Simular Compra Automática
          </CardTitle>
          <CardDescription className="text-green-700">
            Simule uma compra para criar uma Key automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-green-900">Email do Cliente</Label>
              <Input
                type="email"
                value={purchaseUserEmail}
                onChange={(e) => setPurchaseUserEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div>
              <Label className="text-green-900">Plano Comprado</Label>
              <select
                value={purchaseKeyType}
                onChange={(e) => setPurchaseKeyType(e.target.value)}
                className="w-full p-2 border border-green-200 rounded-md focus:border-green-400 focus:outline-none"
              >
                <option value="1 mês">Plano 1 Mês - R$ 29,90</option>
                <option value="3 meses">Plano 3 Meses - R$ 79,90</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={simulatePurchase} className="w-full bg-green-600 hover:bg-green-700">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Simular Compra
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-blue-900">
              {keys.filter((k) => k.status === "Ativo" && k.type === "1 mês").length}
            </div>
            <p className="text-sm text-blue-700">Keys 1 Mês Ativas</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-purple-900">
              {keys.filter((k) => k.status === "Ativo" && k.type === "3 meses").length}
            </div>
            <p className="text-sm text-purple-700">Keys 3 Meses Ativas</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-red-900">
              {keys.filter((k) => k.status === "Expirado" || k.status === "Desativado").length}
            </div>
            <p className="text-sm text-red-700">Keys Inativas</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-gray-900">{keys.length}</div>
            <p className="text-sm text-gray-700">Total de Keys</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2 text-accent" />
            Keys Criadas Automaticamente
          </CardTitle>
          <CardDescription>Todas as Keys criadas pelo sistema de compra automática</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keys.map((key) => (
              <div
                key={key.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  key.status === "Ativo"
                    ? "bg-green-50 border-green-200"
                    : key.status === "Expirado"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <code className="bg-card px-3 py-2 rounded border font-mono text-sm">{key.key}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(key.key)
                          setCopiedKey(key.key)
                          setTimeout(() => setCopiedKey(""), 2000)
                        }}
                      >
                        {copiedKey === key.key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Tipo:</span>
                        <Badge
                          className={`ml-2 ${key.type === "1 mês" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}
                        >
                          {key.type}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <Badge
                          className={`ml-2 ${
                            key.status === "Ativo"
                              ? "bg-green-100 text-green-800"
                              : key.status === "Expirado"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {key.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Cliente:</span>
                        <div className="text-muted-foreground">{key.userEmail}</div>
                      </div>
                      <div>
                        <span className="font-medium">Dias Restantes:</span>
                        <div
                          className={`font-bold ${
                            key.daysRemaining > 7
                              ? "text-green-600"
                              : key.daysRemaining > 0
                                ? "text-orange-600"
                                : "text-red-600"
                          }`}
                        >
                          {key.daysRemaining} dias
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>Criada: {new Date(key.createdAt).toLocaleDateString("pt-BR")}</div>
                      <div>Expira: {new Date(key.expiryDate).toLocaleDateString("pt-BR")}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {key.status === "Ativo" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setKeys(
                            keys.map((k) => (k.id === key.id ? { ...k, status: "Desativado", daysRemaining: 0 } : k)),
                          )
                          setUsers(
                            users.map((user) =>
                              user.keyUsed === key.key ? { ...user, status: "Desconectado" } : user,
                            ),
                          )
                        }}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setKeys(keys.filter((k) => k.id !== key.id))
                        setUsers(users.filter((user) => user.keyUsed !== key.key))
                      }}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-foreground">Usuários Ativos</h2>
          <p className="text-muted-foreground mt-2">Gerencie todos os usuários com acesso ao sistema</p>
        </div>
        <Badge variant="secondary" className="bg-accent/10 text-accent">
          {users.filter((u) => u.status === "Ativo").length} usuários online
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-900">{users.filter((u) => u.status === "Ativo").length}</div>
            <p className="text-sm text-green-700">Usuários Ativos</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-red-900">
              {users.filter((u) => u.status === "Desconectado").length}
            </div>
            <p className="text-sm text-red-700">Usuários Desconectados</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-blue-900">{users.length}</div>
            <p className="text-sm text-blue-700">Total de Usuários</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-accent" />
            Lista de Usuários
          </CardTitle>
          <CardDescription>Todos os usuários registrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  user.status === "Ativo" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="font-semibold text-foreground">{user.email}</div>
                      <Badge className={user.status === "Ativo" ? "bg-green-500" : "bg-red-500"}>{user.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Key Usada:</span>
                        <code className="block bg-card px-2 py-1 rounded text-xs mt-1">{user.keyUsed}</code>
                      </div>
                      <div>
                        <span className="font-medium">Plano:</span>
                        <Badge
                          className={`ml-2 ${user.keyType === "1 mês" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}
                        >
                          {user.keyType}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Último Acesso:</span>
                        <div className="text-muted-foreground">{user.lastAccess}</div>
                      </div>
                      <div>
                        <span className="font-medium">Expira em:</span>
                        <div className="text-muted-foreground">
                          {new Date(user.expiryDate).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>Início: {new Date(user.startDate).toLocaleDateString("pt-BR")}</div>
                      <div>Fim: {new Date(user.expiryDate).toLocaleDateString("pt-BR")}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {user.status === "Ativo" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setUsers(users.map((u) => (u.id === user.id ? { ...u, status: "Desconectado" } : u)))
                          setKeys(
                            keys.map((key) => (key.key === user.keyUsed ? { ...key, status: "Desativado" } : key)),
                          )
                        }}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setUsers(users.filter((u) => u.id !== user.id))
                        setKeys(keys.filter((key) => key.key !== user.keyUsed))
                      }}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-2">Visão geral do sistema de chat VIP</p>
        </div>
        <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
          Tempo real
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total de Visitas</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalVisits.toLocaleString()}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-full">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-blue-600 ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Vendas Totais</p>
                <p className="text-3xl font-bold text-green-900">{stats.totalSales}</p>
              </div>
              <div className="bg-green-500 p-3 rounded-full">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8.2%</span>
              <span className="text-green-600 ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Receita Total</p>
                <p className="text-3xl font-bold text-purple-900">R$ {stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+15.3%</span>
              <span className="text-purple-600 ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Usuários Online</p>
                <p className="text-3xl font-bold text-orange-900">{stats.onlineUsers}</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-full">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-orange-600">Ativos agora</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <ImageIcon className="w-5 h-5 mr-2 text-accent" />
              Atividade Recente dos Chats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(chats || []).map((chat) => (
                <div key={chat.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={chat.image || "/placeholder.svg"}
                      alt={chat.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-foreground">{chat.name}</p>
                      <p className="text-sm text-muted-foreground">{chat.members} membros</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{chat.lastActivity}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Key className="w-5 h-5 mr-2 text-accent" />
              Status das Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900">Keys Ativas</span>
                <Badge className="bg-green-500">{keys.filter((k) => k.status === "Ativo").length}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-red-900">Keys Expiradas</span>
                <Badge variant="destructive">{keys.filter((k) => k.status === "Expirado").length}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-900">Total de Keys</span>
                <Badge variant="secondary">{keys.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const createKeyOnPurchase = async (keyType: string, userEmail: string) => {
    const keyCode = `VIP-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    const currentDate = new Date()
    const expiryDate = new Date()
    const monthsToAdd = keyType === "1 mês" ? 1 : 3
    expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd)

    const daysRemaining = Math.ceil((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("access_keys")
        .insert({
          key_code: keyCode,
          key_type: keyType,
          user_email: userEmail,
          expires_at: expiryDate.toISOString(),
          status: "Ativo",
        })
        .select()
        .single()

      if (error) {
        console.error("Erro ao criar chave no banco:", error)
        alert("Erro ao criar chave no banco de dados!")
        return
      }

      const newKey = {
        id: Date.now(),
        key: keyCode,
        type: keyType,
        status: "Ativo",
        createdAt: currentDate.toISOString().split("T")[0],
        expiryDate: expiryDate.toISOString().split("T")[0],
        userEmail: userEmail,
        daysRemaining: daysRemaining,
      }

      setKeys([...keys, newKey])

      const newUser = {
        id: Date.now(),
        email: userEmail,
        keyUsed: keyCode,
        keyType: keyType,
        startDate: currentDate.toISOString().split("T")[0],
        expiryDate: expiryDate.toISOString().split("T")[0],
        status: "Ativo",
        lastAccess: new Date().toLocaleString("pt-BR"),
      }

      setUsers([...users, newUser])

      alert(
        `Key criada com sucesso no banco de dados!\\nCódigo: ${keyCode}\\nTipo: ${keyType}\\nExpira em: ${expiryDate.toLocaleDateString("pt-BR")}`,
      )

      return keyCode
    } catch (error) {
      console.error("Erro ao criar chave:", error)
      alert("Erro ao conectar com o banco de dados!")
    }
  }

  const simulatePurchase = () => {
    if (!purchaseUserEmail) {
      alert("Digite o email do usuário!")
      return
    }

    createKeyOnPurchase(purchaseKeyType, purchaseUserEmail)
    setPurchaseUserEmail("")
  }

  const renderContent = () => {
    switch (activeSection) {
      case "chats":
        return renderChats()
      case "keys":
        return renderKeys()
      case "users":
        return renderUsers()
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-muted-foreground hover:text-foreground"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Painel Administrador
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1">
                Sistema Online
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
              >
                <Settings className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`${
            sidebarOpen ? "w-72" : "w-0"
          } transition-all duration-300 overflow-hidden bg-card border-r border-border shadow-sm`}
        >
          <nav className="p-6 space-y-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "chats", label: "Gerenciar Chats", icon: MessageSquare },
              { id: "keys", label: "Sistema de Keys", icon: Key },
              { id: "users", label: "Usuários Ativos", icon: Users },
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className={`w-full justify-start text-left transition-all ${
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">{renderContent()}</main>
      </div>
    </div>
  )
}
