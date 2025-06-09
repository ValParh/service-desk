"use client"

import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, ThumbsUp, ThumbsDown, Trash2, Edit, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { dataStore, type Article } from "@/lib/data-store"
import { useLanguage } from "@/contexts/language-context"

export default function KnowledgeBasePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [articles, setArticles] = useState<Article[]>([])
  const { t } = useLanguage()

  useEffect(() => {
    dataStore.init()
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      const allArticles = dataStore.getArticles()
      setArticles(allArticles.filter((article) => article.isPublished))
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  if (!user) {
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

  // Безопасное получение категорий
  const categories = Array.from(
    new Set(articles.map((a) => a.category).filter((category) => category && category.trim() !== "")),
  )

  const filteredAndSortedArticles = articles
    .filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = categoryFilter === "all" || article.category === categoryFilter

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "most-viewed":
          return b.views - a.views
        case "most-helpful":
          return b.helpful - a.helpful
        default:
          return 0
      }
    })

  const handleVote = (articleId: string, vote: "helpful" | "not-helpful") => {
    if (user) {
      const success = dataStore.voteArticle(articleId, user.id, vote)
      if (success) {
        const updatedArticles = dataStore.getArticles()
        setArticles(updatedArticles.filter((article) => article.isPublished))
      }
    }
  }

  const handleDeleteArticle = (articleId: string) => {
    if (confirm("Вы уверены, что хотите удалить эту статью? Это действие нельзя отменить.")) {
      const success = dataStore.deleteArticle(articleId)
      if (success) {
        const updatedArticles = dataStore.getArticles()
        setArticles(updatedArticles.filter((article) => article.isPublished))
      }
    }
  }

  const canManageArticles = user.role === "support" || user.role === "admin"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("kb.title")}</h1>
            <p className="text-gray-600 mt-2">{t("kb.subtitle")}</p>
          </div>
          {canManageArticles && (
            <Link href="/knowledge-base/manage">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                {t("kb.createArticle")}
              </Button>
            </Link>
          )}
        </div>

        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder={t("kb.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("kb.allCategories")}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t("kb.sortNewest")}</SelectItem>
              <SelectItem value="oldest">{t("kb.sortOldest")}</SelectItem>
              <SelectItem value="most-viewed">{t("kb.sortMostViewed")}</SelectItem>
              <SelectItem value="most-helpful">{t("kb.sortMostHelpful")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredAndSortedArticles.map((article) => {
            const userVotes = article.userVotes || {}
            const userVote = user?.id ? userVotes[user.id] : undefined

            return (
              <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getCategoryColor(article.category)}>{article.category}</Badge>
                    <div className="flex space-x-1">
                      <FileText className="w-5 h-5 text-gray-400" />
                      {canManageArticles && (user.role === "admin" || article.authorId === user.id) && (
                        <>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              handleDeleteArticle(article.id)
                            }}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-orange-600 transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{article.content.substring(0, 150)}...</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">
                      {article.views} {t("kb.views")}
                    </span>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          handleVote(article.id, "helpful")
                        }}
                        className={`h-6 p-1 ${userVote === "helpful" ? "text-green-600" : "text-gray-500"}`}
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        <span>{article.helpful || 0}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          handleVote(article.id, "not-helpful")
                        }}
                        className={`h-6 p-1 ${userVote === "not-helpful" ? "text-red-600" : "text-gray-500"}`}
                      >
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        <span>{article.notHelpful || 0}</span>
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {t("kb.author")} {article.authorName}
                    </span>
                    <Link
                      href={`/knowledge-base/${article.id}`}
                      className="flex items-center text-orange-600 group-hover:text-orange-700"
                    >
                      <span className="text-sm font-medium mr-1">{t("kb.readArticle")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredAndSortedArticles.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">{t("kb.noArticles")}</p>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-sm text-gray-500">Страница 1 из 1</div>
      </div>
    </div>
  )
}
