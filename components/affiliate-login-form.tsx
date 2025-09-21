"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock } from "lucide-react"

export function AffiliateLoginForm() {
  const [email, setEmail] = useState("demo@afiliado.com")
  const [password, setPassword] = useState("demo123")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const createDemoUser = async () => {
      try {
        await fetch("/api/create-demo-user", { method: "POST" })
      } catch (error) {
        console.log("[v0] Erro ao criar usuário demo:", error)
      }
    }
    createDemoUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("[v0] Form - Tentando fazer login com:", { email })

      const response = await fetch("/api/affiliate/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Garantir que cookies sejam incluídos
      })

      const data = await response.json()
      console.log("[v0] Form - Resposta do login:", data)

      if (data.success) {
        console.log("[v0] Form - Login bem-sucedido, redirecionando...")
        window.location.href = "/afiliado"
      } else {
        setError(data.error || "Erro ao fazer login")
      }
    } catch (error) {
      console.error("[v0] Form - Erro no login:", error)
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert className="bg-red-900 border-red-700">
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-200">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            placeholder="demo@afiliado.com"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-200">
          Senha
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            placeholder="demo123"
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>

      <div className="text-center text-sm text-gray-400 mt-4 p-3 bg-gray-800 rounded">
        <p className="font-semibold text-gray-300">Credenciais Demo:</p>
        <p>Email: demo@afiliado.com</p>
        <p>Senha: demo123</p>
      </div>
    </form>
  )
}
