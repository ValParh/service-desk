import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)

    if (!currentUser) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const priority = searchParams.get("priority") || ""
    const assignedTo = searchParams.get("assignedTo") || ""

    const where: any = {}

    // Фильтрация по роли пользователя
    if (currentUser.role === "CLIENT") {
      where.clientId = currentUser.id
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { ticketNumber: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status && status !== "all") {
      where.status = status.toUpperCase()
    }

    if (priority && priority !== "all") {
      where.priority = priority.toUpperCase()
    }

    if (assignedTo && assignedTo !== "all") {
      if (assignedTo === "unassigned") {
        where.assignedTo = null
      } else {
        where.assignedTo = Number.parseInt(assignedTo)
      }
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        category: true,
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        assignedUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error("Get tickets error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)

    if (!currentUser) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const ticketData = await request.json()
    const { title, description, priority, categoryId, clientId } = ticketData

    // Проверка обязательных полей
    if (!title || !description || !priority) {
      return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 })
    }

    // Генерация номера запроса
    const ticketNumber = await generateTicketNumber()

    // Определение клиента (если создает клиент - он сам, если админ/поддержка - указанный)
    const finalClientId = currentUser.role === "CLIENT" ? currentUser.id : clientId || currentUser.id

    // Создание запроса
    const newTicket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title,
        description,
        priority: priority.toUpperCase(),
        categoryId: categoryId ? Number.parseInt(categoryId) : null,
        clientId: finalClientId,
      },
    })

    return NextResponse.json({ ticket: newTicket }, { status: 201 })
  } catch (error) {
    console.error("Create ticket error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.ticket.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  })
  return `TK-${year}-${(count + 1).toString().padStart(4, "0")}`
}
