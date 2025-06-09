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
    const category = searchParams.get("category") || ""

    const where: any = { isPublished: true }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category && category !== "all") {
      where.category = category
    }

    const articles = await prisma.knowledgeBaseArticle.findMany({
      where,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ articles })
  } catch (error) {
    console.error("Get articles error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)

    if (!currentUser || (currentUser.role !== "SUPPORT" && currentUser.role !== "ADMIN")) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const articleData = await request.json()
    const { title, content, category, tags, isPublished } = articleData

    // Проверка обязательных полей
    if (!title || !content || !category) {
      return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 })
    }

    // Создание статьи
    const newArticle = await prisma.knowledgeBaseArticle.create({
      data: {
        title,
        content,
        category,
        tags: tags || [],
        authorId: currentUser.id,
        isPublished: isPublished || false,
      },
    })

    return NextResponse.json({ article: newArticle }, { status: 201 })
  } catch (error) {
    console.error("Create article error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
