import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(request)

    if (!currentUser) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const ticketId = params.id

    const tickets = await query(
      `
      SELECT 
        t.*,
        c.name as category_name,
        client.first_name as client_first_name,
        client.last_name as client_last_name,
        client.email as client_email,
        client.phone as client_phone,
        assigned.first_name as assigned_first_name,
        assigned.last_name as assigned_last_name
      FROM tickets t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users client ON t.client_id = client.id
      LEFT JOIN users assigned ON t.assigned_to = assigned.id
      WHERE t.id = ? OR t.ticket_number = ?
    `,
      [ticketId, ticketId],
    )

    if (tickets.length === 0) {
      return NextResponse.json({ error: "Запрос не найден" }, { status: 404 })
    }

    const ticket = tickets[0]

    // Проверка доступа (клиент может видеть только свои запросы)
    if (currentUser.role === "client" && ticket.client_id !== currentUser.id) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    // Получение комментариев
    const comments = await query(
      `
      SELECT 
        tc.*,
        u.first_name,
        u.last_name,
        u.role
      FROM ticket_comments tc
      JOIN users u ON tc.author_id = u.id
      WHERE tc.ticket_id = ?
      ORDER BY tc.created_at ASC
    `,
      [ticket.id],
    )

    return NextResponse.json({
      ticket: {
        ...ticket,
        comments,
      },
    })
  } catch (error) {
    console.error("Get ticket error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(request)

    if (!currentUser || (currentUser.role !== "support" && currentUser.role !== "admin")) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const ticketId = params.id
    const updateData = await request.json()

    const { status, priority, assignedTo } = updateData

    const updateFields = []
    const queryParams = []

    if (status) {
      updateFields.push("status = ?")
      queryParams.push(status)

      if (status === "closed") {
        updateFields.push("closed_at = CURRENT_TIMESTAMP")
      }
    }

    if (priority) {
      updateFields.push("priority = ?")
      queryParams.push(priority)
    }

    if (assignedTo !== undefined) {
      updateFields.push("assigned_to = ?")
      queryParams.push(assignedTo || null)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "Нет данных для обновления" }, { status: 400 })
    }

    queryParams.push(ticketId)

    await query(
      `
      UPDATE tickets 
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? OR ticket_number = ?
    `,
      [...queryParams, ticketId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update ticket error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
