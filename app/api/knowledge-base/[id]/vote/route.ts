import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(request)

    if (!currentUser) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const articleId = params.id
    const { isHelpful } = await request.json()

    if (typeof isHelpful !== "boolean") {
      return NextResponse.json({ error: "Некорректные данные голоса" }, { status: 400 })
    }

    // Проверка существования статьи
    const articles = await query("SELECT id FROM knowledge_base_articles WHERE id = ? AND is_published = TRUE", [
      articleId,
    ])

    if (articles.length === 0) {
      return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
    }

    // Проверка существующего голоса
    const existingVotes = await query("SELECT id, is_helpful FROM article_votes WHERE article_id = ? AND user_id = ?", [
      articleId,
      currentUser.id,
    ])

    if (existingVotes.length > 0) {
      const existingVote = existingVotes[0]

      if (existingVote.is_helpful === isHelpful) {
        return NextResponse.json({ error: "Вы уже проголосовали" }, { status: 400 })
      }

      // Обновление существующего голоса
      await query("UPDATE article_votes SET is_helpful = ? WHERE id = ?", [isHelpful, existingVote.id])

      // Обновление счетчиков в статье
      if (isHelpful) {
        await query(
          "UPDATE knowledge_base_articles SET helpful_votes = helpful_votes + 1, not_helpful_votes = not_helpful_votes - 1 WHERE id = ?",
          [articleId],
        )
      } else {
        await query(
          "UPDATE knowledge_base_articles SET helpful_votes = helpful_votes - 1, not_helpful_votes = not_helpful_votes + 1 WHERE id = ?",
          [articleId],
        )
      }
    } else {
      // Создание нового голоса
      await query("INSERT INTO article_votes (article_id, user_id, is_helpful) VALUES (?, ?, ?)", [
        articleId,
        currentUser.id,
        isHelpful,
      ])

      // Обновление счетчиков в статье
      if (isHelpful) {
        await query("UPDATE knowledge_base_articles SET helpful_votes = helpful_votes + 1 WHERE id = ?", [articleId])
      } else {
        await query("UPDATE knowledge_base_articles SET not_helpful_votes = not_helpful_votes + 1 WHERE id = ?", [
          articleId,
        ])
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Vote article error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
