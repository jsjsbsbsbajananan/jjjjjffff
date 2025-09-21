import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 })
    }

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("chat_id", id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    return NextResponse.json(messages || [])
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { content, message_type, file_url, is_pinned } = await request.json()
    const { id } = params

    const { data, error } = await supabase
      .from("chat_messages")
      .insert([
        {
          chat_id: id,
          content,
          message_type: message_type || "text",
          file_url,
          is_pinned: is_pinned || false,
          created_by: "admin",
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Update chat's updated_at timestamp
    await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", id)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}
