"use client"

import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ThumbsUp, ThumbsDown, Eye, Calendar, User, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { dataStore, type KnowledgeBaseArticle } from "@/lib/data-store"

export default function KnowledgeBaseArticlePage({ params }: { params: { id: string } }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [article, setArticle] = useState<KnowledgeBaseArticle | null>(null)
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    dataStore.init()
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const articles = dataStore.getArticles()
    const foundArticle = articles.find((a) => a.id === params.id)
    if (foundArticle && foundArticle.isPublished) {
      // Увеличиваем счетчик просмотров
      dataStore.incrementViews(foundArticle.id)
      // Получаем обновленную статью
      const updatedArticles = dataStore.getArticles()
      const updatedArticle = updatedArticles.find((a) => a.id === params.id)
      setArticle(updatedArticle || foundArticle)

      // Проверяем, голосовал ли пользователь
      if (user && foundArticle.userVotes && foundArticle.userVotes[user.id]) {
        setHasVoted(true)
      }
    }
  }, [params.id, user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  if (!user || !article) {
    return null
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Безопасность":
        return "bg-red-100 text-red-800"
      case "Оборудование":
        return "bg-blue-100 text-blue-800"
      case "Коммуникации":
        return "bg-green-100 text-green-800"
      case "Сеть":
        return "bg-yellow-100 text-yellow-800"
      case "Программное обеспечение":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleVote = (isHelpful: boolean) => {
    if (!hasVoted && user) {
      const updatedArticle = dataStore.voteArticle(article.id, user.id, isHelpful)
      if (updatedArticle) {
        setArticle(updatedArticle)
        setHasVoted(true)
      }
    }
  }

  const handleDeleteArticle = () => {
    if (user.role === "admin" && confirm("Вы уверены, что хотите удалить эту статью?")) {
      dataStore.deleteArticle(article.id)
      router.push("/knowledge-base")
    }
  }

  const canDelete = user.role === "admin"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/knowledge-base" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к базе знаний
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <Badge className={getCategoryColor(article.category)}>{article.category}</Badge>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{article.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{article.helpful}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ThumbsDown className="w-4 h-4" />
                  <span>{article.notHelpful}</span>
                </div>
                {canDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteArticle}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <CardTitle className="text-2xl mb-4">{article.title}</CardTitle>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{article.authorName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Создано: {article.createdAt}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Обновлено: {article.updatedAt}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{article.content}</div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-medium mb-4">Была ли эта статья полезной?</h3>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => handleVote(true)}
                  disabled={hasVoted}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Да ({article.helpful})</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => handleVote(false)}
                  disabled={hasVoted}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>Нет ({article.notHelpful})</span>
                </Button>
              </div>
              {hasVoted && <p className="text-sm text-green-600 mt-2">Спасибо за вашу оценку!</p>}
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Теги:</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
