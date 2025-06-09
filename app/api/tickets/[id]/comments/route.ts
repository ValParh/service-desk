import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(request)

    if (!currentUser) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const ticketId = params.id
    const { content, isInternal } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Содержание комментария обязательно" }, { status: 400 })
    }

    // Проверка существования запроса и доступа к нему
    const tickets = await query("SELECT id, client_id FROM tickets WHERE id = ? OR ticket_number = ?", [
      ticketId,
      ticketId,
    ])

    if (tickets.length === 0) {
      return NextResponse.json({ error: "Запрос не найден" }, { status: 404 })
    }

    const ticket = tickets[0]

    // Проверка доступа
    if (currentUser.role === "client" && ticket.client_id !== currentUser.id) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    // Клиенты не могут создавать внутренние комментарии
    const finalIsInternal = currentUser.role === "client" ? false : isInternal || false

    // Создание комментария
    const result = await query(
      `
      INSERT INTO ticket_comments (ticket_id, author_id, content, is_internal)
      VALUES (?, ?, ?, ?)
    `,
      [ticket.id, currentUser.id, content.trim(), finalIsInternal],
    )

    // Обновление времени изменения запроса
    await query("UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [ticket.id])

    const newComment = {
      id: result.insertId,
      ticketId: ticket.id,
      authorId: currentUser.id,
      content: content.trim(),
      isInternal: finalIsInternal,
      authorName: `${currentUser.firstName} ${currentUser.lastName}`,
    }

    return NextResponse.json({ comment: newComment }, { status: 201 })
  } catch (error) {
    console.error("Create comment error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
