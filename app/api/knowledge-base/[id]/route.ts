import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(request)

    if (!currentUser) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const articleId = params.id

    const articles = await query(
      `
      SELECT 
        a.*,
        u.first_name as author_first_name,
        u.last_name as author_last_name
      FROM knowledge_base_articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.id = ? AND a.is_published = TRUE
    `,
      [articleId],
    )

    if (articles.length === 0) {
      return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
    }

    const article = articles[0]

    // Увеличение счетчика просмотров
    await query("UPDATE knowledge_base_articles SET views = views + 1 WHERE id = ?", [articleId])

    return NextResponse.json({ article })
  } catch (error) {
    console.error("Get article error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(request)

    if (!currentUser || (currentUser.role !== "support" && currentUser.role !== "admin")) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const articleId = params.id
    const updateData = await request.json()

    const { title, content, category, tags, isPublished } = updateData

    // Проверка существования статьи
    const existingArticles = await query("SELECT id, author_id FROM knowledge_base_articles WHERE id = ?", [articleId])

    if (existingArticles.length === 0) {
      return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
    }

    const article = existingArticles[0]

    // Проверка прав (автор или админ)
    if (currentUser.role !== "admin" && article.author_id !== currentUser.id) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    // Обновление статьи
    await query(
      `
      UPDATE knowledge_base_articles 
      SET title = ?, content = ?, category = ?, tags = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [title, content, category, JSON.stringify(tags || []), isPublished, articleId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update article error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(request)

    if (!currentUser || (currentUser.role !== "support" && currentUser.role !== "admin")) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const articleId = params.id

    // Проверка существования статьи
    const existingArticles = await query("SELECT id, author_id FROM knowledge_base_articles WHERE id = ?", [articleId])

    if (existingArticles.length === 0) {
      return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
    }

    const article = existingArticles[0]

    // Проверка прав (автор или админ)
    if (currentUser.role !== "admin" && article.author_id !== currentUser.id) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    // Удаление статьи (каскадное удаление голосов)
    await query("DELETE FROM knowledge_base_articles WHERE id = ?", [articleId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete article error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
