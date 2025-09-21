"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Key, Shield, Users, MessageSquare, AlertCircle, CheckCircle, Home } from "lucide-react"
import { validateAccessKey, createUserSession } from "@/lib/auth"
import Link from "next/link"

export default function LoginPage() {
  const [keyInput, setKeyInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyInput.trim()) {
      setError("Digite sua Key de acesso")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const validation = await validateAccessKey(keyInput.trim())

      if (!validation.success) {
        setError(validation.message)
        setIsLoading(false)
        return
      }

      if (validation.key) {
        // Criar sessão de usuário
        const sessionResult = await createUserSession(validation.key)

        if (sessionResult.success) {
          setSuccess("Key válida! Redirecionando para o chat...")
          setTimeout(() => {
            router.push("/chat")
          }, 1500)
        } else {
          setError("Erro ao criar sessão. Tente novamente.")
        }
      }
    } catch (error) {
      console.error("Erro no login:", error)
      setError("Erro interno. Tente novamente.")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-primary to-accent p-3 rounded-full">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Acesso VIP</h1>
          <p className="text-muted-foreground">Digite sua Key para acessar o chat exclusivo</p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center flex items-center justify-center">
              <Key className="w-5 h-5 mr-2 text-accent" />
              Login com Key
            </CardTitle>
            <CardDescription className="text-center">Insira sua Key de acesso para entrar no sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key">Key de Acesso</Label>
                <Input
                  id="key"
                  type="text"
                  placeholder="VIP-XXXX-XXXX-XXXX"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                  className="text-center font-mono tracking-wider"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-destructive bg-destructive/10 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{success}</span>
                </div>
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? "Validando..." : "Entrar"}
              </Button>
            </form>

            <div className="text-center">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="bg-card p-3 rounded-lg">
              <Users className="w-6 h-6 mx-auto text-accent" />
            </div>
            <p className="text-xs text-muted-foreground">Grupos Exclusivos</p>
          </div>
          <div className="space-y-2">
            <div className="bg-card p-3 rounded-lg">
              <MessageSquare className="w-6 h-6 mx-auto text-accent" />
            </div>
            <p className="text-xs text-muted-foreground">Chat Premium</p>
          </div>
          <div className="space-y-2">
            <div className="bg-card p-3 rounded-lg">
              <Shield className="w-6 h-6 mx-auto text-accent" />
            </div>
            <p className="text-xs text-muted-foreground">Acesso Seguro</p>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">Não tem uma Key? Entre em contato para adquirir</p>
          <Badge variant="secondary" className="text-xs">
            Sistema de Acesso VIP
          </Badge>
        </div>
      </div>
    </div>
  )
}
