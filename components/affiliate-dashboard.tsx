"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  TrendingUp,
  Copy,
  Link,
  Settings,
  DollarSign,
  Eye,
  UserPlus,
  Menu,
  X,
  Ruler,
  Home,
  CreditCard,
  BarChart,
  User,
} from "lucide-react"
import type { Affiliate, AffiliateStats } from "@/lib/affiliate-auth"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AffiliateDashboardProps {
  affiliate: Affiliate
  stats: AffiliateStats
}

export function AffiliateDashboard({ affiliate, stats }: AffiliateDashboardProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const safeStats = {
    total_clicks: stats?.total_clicks || 0,
    total_referrals: stats?.total_referrals || 0,
    active_referrals: stats?.active_referrals || 0,
    total_commission: stats?.total_commission || 0,
  }

  const affiliateLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://vazadosdasbaixinhas.com"}?ref=${affiliate?.affiliate_code || "demo"}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar link:", err)
    }
  }

  const affiliateData = [
    { time: "00:00", clicks: 12 },
    { time: "04:00", clicks: 8 },
    { time: "08:00", clicks: 25 },
    { time: "12:00", clicks: 45 },
    { time: "16:00", clicks: 38 },
    { time: "20:00", clicks: 62 },
    { time: "23:59", clicks: 28 },
  ]

  const recentReferrals = [
    {
      user: "Usuario123",
      action: "se cadastrou pelo seu link",
      time: "Hoje às 14:30",
      commission: "R$ 15,00",
    },
    {
      user: "NovoMembro",
      action: "fez uma compra",
      time: "Ontem às 22:15",
      commission: "R$ 25,00",
    },
    {
      user: "Cliente456",
      action: "renovou assinatura",
      time: "2 dias atrás",
      commission: "R$ 20,00",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header da Sidebar */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Ruler className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">VAZADOS</h2>
                <p className="text-gray-400 text-sm">DAS BAIXINHAS</p>
              </div>
            </div>
          </div>

          {/* Menu de Navegação */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <div className="mb-6">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">PAINEL AFILIADO</p>
              <a href="#" className="flex items-center px-3 py-2 text-white bg-blue-600 rounded-lg transition-colors">
                <Home className="w-4 h-4 mr-3" />
                Dashboard
              </a>
            </div>

            <div className="mb-6">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">AFILIAÇÃO</p>
              <div className="space-y-1">
                <a
                  href="#"
                  className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Link className="w-4 h-4 mr-3" />
                  Meu Link
                </a>
                <a
                  href="#"
                  className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Users className="w-4 h-4 mr-3" />
                  Referidos
                </a>
                <a
                  href="#"
                  className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <DollarSign className="w-4 h-4 mr-3" />
                  Comissões
                </a>
                <a
                  href="#"
                  className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <BarChart className="w-4 h-4 mr-3" />
                  Relatórios
                </a>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">CONTA</p>
              <div className="space-y-1">
                <a
                  href="#"
                  className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 mr-3" />
                  Perfil
                </a>
                <a
                  href="#"
                  className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <CreditCard className="w-4 h-4 mr-3" />
                  Pagamentos
                </a>
                <a
                  href="#"
                  className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Configurações
                </a>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col lg:ml-0">
        <header className="bg-gray-800 border-b border-gray-700 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-gray-400 hover:text-white"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <h1 className="text-white text-xl font-bold">Painel de Afiliados</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="text-white font-semibold">R$ {safeStats.total_commission.toFixed(2)}</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{affiliate?.name?.charAt(0).toUpperCase() || "A"}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 bg-gray-900">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-blue-600 border-0 rounded-xl">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-xl lg:text-2xl font-bold mb-1">{safeStats.total_clicks}</p>
                <p className="text-blue-100 text-sm">Cliques</p>
              </CardContent>
            </Card>

            <Card className="bg-green-600 border-0 rounded-xl">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-xl lg:text-2xl font-bold mb-1">{safeStats.total_referrals}</p>
                <p className="text-green-100 text-sm">Referidos</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-600 border-0 rounded-xl">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-xl lg:text-2xl font-bold mb-1">{safeStats.active_referrals}</p>
                <p className="text-purple-100 text-sm">Ativos</p>
              </CardContent>
            </Card>

            <Card className="bg-orange-600 border-0 rounded-xl">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-xl lg:text-2xl font-bold mb-1">
                  R$ {safeStats.total_commission.toFixed(0)}
                </p>
                <p className="text-orange-100 text-sm">Comissões</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700 rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center text-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  Últimos Referidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentReferrals.map((referral, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{referral.user.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{referral.user}</p>
                          <p className="text-gray-400 text-xs">{referral.action}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-semibold text-sm">{referral.commission}</p>
                        <p className="text-gray-400 text-xs">{referral.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center text-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  Cliques Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={affiliateData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#F3F4F6" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="clicks"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "#3B82F6" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800 border-gray-700 rounded-xl mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Link className="w-5 h-5 mr-2" />
                Seu Link de Afiliado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-2 lg:space-y-0 lg:space-x-2">
                <div className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-3 w-full">
                  <code className="text-blue-400 text-sm break-all">{affiliateLink}</code>
                </div>
                <Button onClick={copyLink} className="bg-blue-600 hover:bg-blue-700 w-full lg:w-auto">
                  <Copy className="w-4 h-4 mr-2" />
                  {copiedLink ? "Copiado!" : "Copiar"}
                </Button>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Compartilhe este link para ganhar <span className="text-green-400 font-semibold">30% de comissão</span>{" "}
                em cada venda
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
