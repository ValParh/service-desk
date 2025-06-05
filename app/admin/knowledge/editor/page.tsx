"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Bold,
  ChevronDown,
  Code,
  Eye,
  FileText,
  Heading1,
  Heading2,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Save,
  Send,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Sample categories
const categories = [
  "Безопасность",
  "Оборудование",
  "Программное обеспечение",
  "Сеть",
  "Коммуникации",
  "Данные",
  "Офис",
  "Общие вопросы",
]

// Sample related articles
const relatedArticles = [
  { id: "password-change", title: "Как быстро сменить пароль" },
  { id: "printer-setup", title: "Настройка принтера" },
  { id: "email-setup", title: "Настройка почты" },
  { id: "wifi-connection", title: "Подключение к Wi-Fi" },
  { id: "software-installation", title: "Установка ПО" },
  { id: "account-access", title: "Доступ к аккаунту" },
  { id: "vpn-setup", title: "Настройка VPN" },
  { id: "backup-data", title: "Резервное копирование" },
]

export default function KnowledgeBaseEditor() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("edit")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedRelatedArticles, setSelectedRelatedArticles] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  // Handle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // Handle related article selection
  const toggleRelatedArticle = (articleId: string) => {
    if (selectedRelatedArticles.includes(articleId)) {
      setSelectedRelatedArticles(selectedRelatedArticles.filter((id) => id !== articleId))
    } else {
      setSelectedRelatedArticles([...selectedRelatedArticles, articleId])
    }
  }

  // Handle text formatting
  const formatText = (format: string) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    if (!selectedText) return

    let formattedText = ""

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        break
      case "italic":
        formattedText = `*${selectedText}*`
        break
      case "h1":
        formattedText = `# ${selectedText}`
        break
      case "h2":
        formattedText = `## ${selectedText}`
        break
      case "link":
        formattedText = `[${selectedText}](https://example.com)`
        break
      case "code":
        formattedText = `\`${selectedText}\``
        break
      case "ul":
        formattedText = selectedText
          .split("\n")
          .map((line) => `- ${line}`)
          .join("\n")
        break
      case "ol":
        formattedText = selectedText
          .split("\n")
          .map((line, i) => `${i + 1}. ${line}`)
          .join("\n")
        break
      default:
        return
    }

    // Replace the selected text with the formatted text
    const newContent = content.substring(0, range.startOffset) + formattedText + content.substring(range.endOffset)

    setContent(newContent)
  }

  // Insert image placeholder
  const insertImage = () => {
    const imageUrl = prompt("Введите URL изображения:")
    if (imageUrl) {
      const imageMarkdown = `![Изображение](${imageUrl})`
      setContent(content + "\n\n" + imageMarkdown + "\n")
    }
  }

  // Handle save as draft
  const handleSaveAsDraft = () => {
    if (!title) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, укажите заголовок статьи",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    // Simulate saving
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Черновик сохранен",
        description: "Статья успешно сохранена как черновик",
      })
    }, 1000)
  }

  // Handle publish
  const handlePublish = () => {
    if (!title) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, укажите заголовок статьи",
        variant: "destructive",
      })
      return
    }

    if (!category) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите категорию статьи",
        variant: "destructive",
      })
      return
    }

    if (!content || content.length < 50) {
      toast({
        title: "Ошибка",
        description: "Содержание статьи должно быть не менее 50 символов",
        variant: "destructive",
      })
      return
    }

    setIsPublishing(true)

    // Simulate publishing
    setTimeout(() => {
      setIsPublishing(false)
      toast({
        title: "Статья опубликована",
        description: "Статья успешно опубликована в базе знаний",
      })
    }, 1500)
  }

  // Simple Markdown to HTML converter for preview
  const markdownToHtml = (markdown: string) => {
    let html = markdown
      // Headers
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Links
      .replace(/\[(.*?)\]$$(.*?)$$/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Code
      .replace(/`(.*?)`/g, "<code>$1</code>")
      // Lists
      .replace(/^- (.*$)/gm, "<li>$1</li>")
      // Images
      .replace(/!\[(.*?)\]$$(.*?)$$/g, '<img src="$2" alt="$1" class="my-4 rounded-md max-w-full" />')
      // Paragraphs
      .replace(/^\s*(\n)?(.+)/gm, (m) =>
        /^<(\/)?(h1|h2|h3|ul|ol|li|blockquote|code)/.test(m) ? m : "<p>" + m + "</p>",
      )
      // Line breaks
      .replace(/\n/g, "<br />")

    // Convert unordered list items to proper lists
    if (html.includes("<li>")) {
      html = html.replace(/<li>.*?<\/li>/g, (match) => "<ul>" + match + "</ul>").replace(/<\/ul><ul>/g, "")
    }

    return html
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="text-xl font-bold">Центр сервисной поддержки</div>
          <nav className="flex items-center gap-6">
            <Link href="/knowledge" className="text-sm font-medium">
              База знаний
            </Link>
            <Link href="/requests" className="text-sm font-medium">
              Запросы
            </Link>
            <Link href="/profile" aria-label="Профиль">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href="/admin/knowledge"
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад к управлению
              </Link>
              <h1 className="text-2xl font-bold md:text-3xl">Редактор базы знаний</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveAsDraft} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Сохранение..." : "Сохранить черновик"}
              </Button>
              <Button onClick={handlePublish} disabled={isPublishing}>
                <Send className="mr-2 h-4 w-4" />
                {isPublishing ? "Публикация..." : "Опубликовать"}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Редактирование
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Предпросмотр
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Заголовок статьи</Label>
                    <Input
                      id="title"
                      placeholder="Введите заголовок статьи"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Панель форматирования</Label>
                    <div className="flex flex-wrap gap-1 rounded-md border p-1">
                      <Button variant="ghost" size="icon" onClick={() => formatText("bold")} title="Полужирный">
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => formatText("italic")} title="Курсив">
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => formatText("h1")} title="Заголовок 1">
                        <Heading1 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => formatText("h2")} title="Заголовок 2">
                        <Heading2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => formatText("link")} title="Ссылка">
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => formatText("code")} title="Код">
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => formatText("ul")} title="Маркированный список">
                        <List className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => formatText("ol")} title="Нумерованный список">
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={insertImage} title="Вставить изображение">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Содержание статьи</Label>
                    <div className="relative">
                      <Textarea
                        id="content"
                        placeholder="Введите содержание статьи (поддерживается Markdown)"
                        className="min-h-[300px] font-mono"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        ref={editorRef as React.RefObject<HTMLTextAreaElement>}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Поддерживается Markdown: **жирный**, *курсив*, # Заголовок, ## Подзаголовок, [ссылка](url), `код`
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="preview" className="mt-4">
                  <Card>
                    <CardContent className="p-6">
                      {title ? (
                        <h1 className="mb-4 text-2xl font-bold">{title}</h1>
                      ) : (
                        <p className="mb-4 text-muted-foreground italic">Заголовок статьи</p>
                      )}

                      {category && (
                        <div className="mb-4">
                          <Badge variant="outline" className="bg-muted">
                            {category}
                          </Badge>
                        </div>
                      )}

                      <div className="prose max-w-none">
                        {content ? (
                          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />
                        ) : (
                          <p className="text-muted-foreground italic">Содержание статьи будет отображаться здесь...</p>
                        )}
                      </div>

                      {selectedRelatedArticles.length > 0 && (
                        <div className="mt-8 border-t pt-4">
                          <h3 className="mb-2 font-medium">Связанные статьи:</h3>
                          <ul className="space-y-1">
                            {selectedRelatedArticles.map((id) => (
                              <li key={id} className="text-primary hover:underline">
                                {relatedArticles.find((article) => article.id === id)?.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Категория</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Теги</Label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Связанные статьи</Label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {relatedArticles.map((article) => (
                        <div key={article.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={article.id}
                            checked={selectedRelatedArticles.includes(article.id)}
                            onCheckedChange={() => toggleRelatedArticle(article.id)}
                          />
                          <Label htmlFor={article.id} className="text-sm font-normal cursor-pointer">
                            {article.title}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Настройки публикации</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="featured" />
                        <Label htmlFor="featured" className="text-sm font-normal">
                          Рекомендуемая статья
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="comments" defaultChecked />
                        <Label htmlFor="comments" className="text-sm font-normal">
                          Разрешить комментарии
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">Автор</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          Администратор системы
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Администратор системы</DropdownMenuItem>
                        <DropdownMenuItem>Техническая поддержка</DropdownMenuItem>
                        <DropdownMenuItem>IT отдел</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Центр сервисной поддержки. Все права защищены.
          </p>
          <div className="flex gap-4">
            <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
              Контакты
            </Link>
            <Link href="/faq" className="text-sm text-muted-foreground hover:underline">
              Часто задаваемые вопросы
            </Link>
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:underline">
              Вход
            </Link>
            <Link href="/auth/register" className="text-sm text-muted-foreground hover:underline">
              Регистрация
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
