import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] API: Atualizando chat:", params.id)
    const supabase = await createClient()
    const body = await request.json()
    console.log("[v0] API: Dados para atualização:", body)

    const { name, description, image_url } = body
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "ID do chat é obrigatório" }, { status: 400 })
    }

    if (!name || !description) {
      return NextResponse.json({ error: "Nome e descrição são obrigatórios" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("chats")
      .update({
        name: name.trim(),
        description: description.trim(),
        image_url: image_url || "/images/chat-group.png",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] API: Erro do Supabase ao atualizar:", error)
      throw error
    }

    console.log("[v0] API: Chat atualizado com sucesso:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] API: Erro ao atualizar chat:", error)
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { error } = await supabase.from("chats").update({ is_active: false }).eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting chat:", error)
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 })
  }
}
