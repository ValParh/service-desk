"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getServerSession } from "next-auth"

import prisma from "@/lib/db"
import { authOptions } from "@/lib/auth"

// Схема валидации для создания заявки
const createTicketSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  description: z.string().min(1, "Описание обязательно"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  department: z.string().optional(),
  location: z.string().optional(),
  equipmentType: z.string().optional(),
})

// Схема валидации для обновления заявки
const updateTicketSchema = z.object({
  id: z.string(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  assigneeId: z.string().optional(),
})

// Схема валидации для комментария
const createCommentSchema = z.object({
  ticketId: z.string(),
  content: z.string().min(1, "Комментарий не может быть пустым"),
})

// Создание заявки
export async function createTicket(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { error: "Необходима авторизация" }
  }

  const validatedFields = createTicketSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority") || "MEDIUM",
    department: formData.get("department"),
    location: formData.get("location"),
    equipmentType: formData.get("equipmentType"),
  })

  if (!validatedFields.success) {
    return { error: "Некорректные данные", details: validatedFields.error.flatten().fieldErrors }
  }

  const { title, description, priority, department, location, equipmentType } = validatedFields.data

  try {
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority as any,
        department,
        location,
        equipmentType,
        creatorId: session.user.id,
      },
    })

    revalidatePath("/requests")
    return { success: true, ticketId: ticket.id }
  } catch (error) {
    return { error: "Ошибка при создании заявки" }
  }
}

// Получение всех заявок
export async function getTickets() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { error: "Необходима авторизация" }
  }

  try {
    // Если пользователь администратор или техник, показываем все заявки
    // Иначе показываем только заявки пользователя
    const isAdminOrTechnician = session.user.role === "ADMIN" || session.user.role === "TECHNICIAN"

    const tickets = await prisma.ticket.findMany({
      where: isAdminOrTechnician ? {} : { creatorId: session.user.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { tickets }
  } catch (error) {
    return { error: "Ошибка при получении заявок" }
  }
}

// Получение заявки по ID
export async function getTicketById(id: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { error: "Необходима авторизация" }
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            position: true,
            location: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        attachments: true,
      },
    })

    if (!ticket) {
      return { error: "Заявка не найдена" }
    }

    // Проверка прав доступа
    const isAdminOrTechnician = session.user.role === "ADMIN" || session.user.role === "TECHNICIAN"
    const isCreator = ticket.creatorId === session.user.id
    const isAssignee = ticket.assigneeId === session.user.id

    if (!isAdminOrTechnician && !isCreator && !isAssignee) {
      return { error: "Нет доступа к этой заявке" }
    }

    return { ticket }
  } catch (error) {
    return { error: "Ошибка при получении заявки" }
  }
}

// Обновление статуса заявки
export async function updateTicket(data: { id: string; status?: string; assigneeId?: string }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { error: "Необходима авторизация" }
  }

  const validatedFields = updateTicketSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: "Некорректные данные", details: validatedFields.error.flatten().fieldErrors }
  }

  const { id, status, assigneeId } = validatedFields.data

  try {
    // Проверка прав доступа
    const isAdminOrTechnician = session.user.role === "ADMIN" || session.user.role === "TECHNICIAN"

    if (!isAdminOrTechnician) {
      return { error: "Недостаточно прав для обновления заявки" }
    }

    const updateData: any = {}

    if (status) {
      updateData.status = status

      // Если статус изменен на RESOLVED, устанавливаем дату решения
      if (status === "RESOLVED") {
        updateData.resolvedAt = new Date()
      }
    }

    if (assigneeId) {
      updateData.assigneeId = assigneeId

      // Если назначен исполнитель и статус OPEN, меняем на IN_PROGRESS
      const ticket = await prisma.ticket.findUnique({ where: { id } })
      if (ticket?.status === "OPEN") {
        updateData.status = "IN_PROGRESS"
      }
    }

    await prisma.ticket.update({
      where: { id },
      data: updateData,
    })

    revalidatePath(`/requests/${id}`)
    revalidatePath("/requests")
    return { success: true }
  } catch (error) {
    return { error: "Ошибка при обновлении заявки" }
  }
}

// Добавление комментария к заявке
export async function addComment(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { error: "Необходима авторизация" }
  }

  const validatedFields = createCommentSchema.safeParse({
    ticketId: formData.get("ticketId"),
    content: formData.get("content"),
  })

  if (!validatedFields.success) {
    return { error: "Некорректные данные", details: validatedFields.error.flatten().fieldErrors }
  }

  const { ticketId, content } = validatedFields.data

  try {
    // Проверка существования заявки
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    })

    if (!ticket) {
      return { error: "Заявка не найдена" }
    }

    // Проверка прав доступа
    const isAdminOrTechnician = session.user.role === "ADMIN" || session.user.role === "TECHNICIAN"
    const isCreator = ticket.creatorId === session.user.id
    const isAssignee = ticket.assigneeId === session.user.id

    if (!isAdminOrTechnician && !isCreator && !isAssignee) {
      return { error: "Нет доступа к этой заявке" }
    }

    await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        ticketId,
      },
    })

    revalidatePath(`/requests/${ticketId}`)
    return { success: true }
  } catch (error) {
    return { error: "Ошибка при добавлении комментария" }
  }
}
