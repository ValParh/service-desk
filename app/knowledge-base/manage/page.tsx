"use client"

import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Send, Bold, Italic, List, LinkIcon, Code, ImageIcon, CheckCircle, Eye } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { dataStore } from "@/lib/data-store"
import { useLanguage } from "@/contexts/language-context"

// Простая функция для рендеринга базового Markdown
const renderMarkdown = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
    .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
    .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
    .replace(/\n/g, "<br>")
}

export default function KnowledgeBaseEditorPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isRecommended, setIsRecommended] = useState(false)
  const [allowComments, setAllowComments] = useState(true)
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    dataStore.init()
    if (!isLoading && !user) {
      router.push("/login")
    }
    if (!isLoading && user && user.role === "client") {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  if (!user || user.role === "client") {
    return null
  }

  const categories = [
    "Безопасность",
    "Оборудование",
    "Коммуникации",
    "Сеть",
    "Программное обеспечение",
    "Данные",
    "Офис",
    "Общие вопросы",
  ]

  const availableTags = [
    "Безопасность",
    "Оборудование",
    "Коммуникации",
    "Сеть",
    "Программное обеспечение",
    "Данные",
    "Офис",
    "Общие вопросы",
  ]

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const insertMarkdown = (syntax: string, placeholder = "") => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const replacement = selectedText || placeholder

    let newText = ""
    switch (syntax) {
      case "bold":
        newText = `**${replacement}**`
        break
      case "italic":
        newText = `*${replacement}*`
        break
      case "list":
        newText = `\n- ${replacement || "Элемент списка"}\n- Элемент списка 2`
        break
      case "link":
        newText = `[${replacement || "текст ссылки"}](url)`
        break
      case "code":
        newText = `\`${replacement || "код"}\``
        break
      case "image":
        newText = `![${replacement || "описание"}](url-изображения)`
        break
      case "heading":
        newText = `## ${replacement || "Заголовок"}`
        break
      default:
        return
    }

    const newContent = content.substring(0, start) + newText + content.substring(end)
    setContent(newContent)

    // Устанавливаем курсор после вставленного текста
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + newText.length, start + newText.length)
    }, 0)
  }

  const formatButtons = [
    { icon: Bold, label: "Жирный", action: () => insertMarkdown("bold", "жирный текст") },
    { icon: Italic, label: "Курсив", action: () => insertMarkdown("italic", "курсив") },
    { icon: List, label: "Список", action: () => insertMarkdown("list") },
    { icon: LinkIcon, label: "Ссылка", action: () => insertMarkdown("link") },
    { icon: Code, label: "Код", action: () => insertMarkdown("code") },
    { icon: ImageIcon, label: "Изображение", action: () => insertMarkdown("image") },
  ]

  const handleSaveDraft = () => {
    // Сохранение черновика
    console.log("Сохранение черновика")
  }

  const handlePublish = async () => {
    if (!title.trim() || !content.trim() || !category) {
      alert("Заполните все обязательные поля")
      return
    }

    setIsSubmitting(true)

    try {
      const newArticle = dataStore.addArticle({
        title: title.trim(),
        content: content.trim(),
        category,
        tags: selectedTags,
        authorId: user.id,
        authorName: `${user.firstName} ${user.lastName}`,
        isPublished: true,
      })

      if (newArticle) {
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error("Ошибка публикации статьи:", error)
      alert("Ошибка при публикации статьи")
    }

    setIsSubmitting(false)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("kb.articlePublished")}</h2>
              <p className="text-gray-600 mb-4">{t("kb.articlePublishedDesc").replace("была", `"${title}" была`)}</p>
              <div className="flex gap-4 justify-center">
                <Link href="/knowledge-base">
                  <Button>{t("kb.toKnowledgeBase")}</Button>
                </Link>
                <Link href="/knowledge-base/manage">
                  <Button variant="outline">{t("kb.createAnother")}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/knowledge-base" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к базе знаний
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t("kb.editorTitle")}</h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="w-4 h-4 mr-2" />
              {t("kb.saveDraft")}
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handlePublish} disabled={isSubmitting}>
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? t("kb.publishing") : t("kb.publish")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex space-x-1 border-b">
                  <button
                    onClick={() => setActiveTab("edit")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${
                      activeTab === "edit"
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    {t("kb.editing")}
                  </button>
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${
                      activeTab === "preview"
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    {t("kb.preview")}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">{t("kb.articleTitle")}</Label>
                  <Input
                    id="title"
                    placeholder={t("kb.articleTitlePlaceholder")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {activeTab === "edit" && (
                  <>
                    <div className="space-y-2">
                      <Label>{t("kb.formatPanel")}</Label>
                      <div className="flex gap-2 p-2 border rounded-md bg-gray-50">
                        {formatButtons.map((button) => (
                          <Button
                            key={button.label}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={button.action}
                            title={button.label}
                          >
                            <button.icon className="w-4 h-4" />
                          </Button>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => insertMarkdown("heading")}
                          title="Заголовок"
                        >
                          H2
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">{t("kb.content")}</Label>
                      <Textarea
                        id="content"
                        placeholder={t("kb.contentPlaceholder")}
                        rows={12}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="font-mono"
                      />
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>{t("kb.markdownSupport")}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <span>**жирный** - жирный текст</span>
                          <span>*курсив* - курсив</span>
                          <span>## Заголовок - заголовок</span>
                          <span>[ссылка](url) - ссылка</span>
                          <span>`код` - код</span>
                          <span>- список - маркированный список</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "preview" && (
                  <div className="space-y-4">
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: `<h1 class="text-3xl font-bold mb-4">${title || "Заголовок статьи"}</h1>
                                 <div class="markdown-content">${renderMarkdown(content || "Содержание статьи появится здесь...")}</div>`,
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("tickets.category")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("kb.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("kb.tags")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("kb.publishSettings")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="recommended" checked={isRecommended} onCheckedChange={setIsRecommended} />
                  <label htmlFor="recommended" className="text-sm cursor-pointer">
                    {t("kb.recommended")}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="comments" checked={allowComments} onCheckedChange={setAllowComments} />
                  <label htmlFor="comments" className="text-sm cursor-pointer">
                    {t("kb.allowComments")}
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Автор</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {user.role === "support" ? "Сотрудник поддержки" : "Администратор"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
