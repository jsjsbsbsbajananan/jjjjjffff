import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[v0] API: Buscando chats...")
    const supabase = await createClient()

    const { data: chats, error } = await supabase
      .from("chats")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] API: Erro do Supabase:", error)
      throw error
    }

    console.log("[v0] API: Chats encontrados:", chats?.length || 0)

    const transformedChats =
      chats?.map((chat) => ({
        ...chat,
        messages: 0,
        members: 0,
        lastActivity: new Date(chat.updated_at).toLocaleString("pt-BR"),
      })) || []

    return NextResponse.json(transformedChats)
  } catch (error) {
    console.error("[v0] API: Erro ao buscar chats:", error)
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] API: Criando novo chat...")
    const supabase = await createClient()
    const body = await request.json()
    console.log("[v0] API: Dados recebidos:", body)

    const { name, description, image_url } = body

    if (!name || !description) {
      console.error("[v0] API: Dados obrigatórios ausentes")
      return NextResponse.json({ error: "Nome e descrição são obrigatórios" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("chats")
      .insert([
        {
          name: name.trim(),
          description: description.trim(),
          image_url: image_url || "/images/chat-group.png",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] API: Erro do Supabase ao criar:", error)
      throw error
    }

    console.log("[v0] API: Chat criado com sucesso:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] API: Erro ao criar chat:", error)
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 })
  }
}
