import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, User, Clock, Calendar, Edit, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { mockArticles } from "@/lib/mock-data"
import { mockAuth } from "@/lib/mock-auth"

export default function PasswordChangeArticlePage() {
  const currentUser = mockAuth.getCurrentUser()
  const isAdmin = mockAuth.isAdmin()
  const article = mockArticles.find((a) => a.slug === "password-change")

  if (!article) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Статья не найдена</h2>
          <p className="text-muted-foreground mb-4">Запрашиваемая статья не существует</p>
          <Link href="/knowledge">
            <Button>Вернуться к базе знаний</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
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
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{currentUser.name}</span>
                <Link href="/profile" aria-label="Профиль">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  Войти
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/knowledge"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к базе знаний
            </Link>

            {isAdmin && (
              <Link href="/admin/knowledge/editor">
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Редактировать статью
                </Button>
              </Link>
            )}
          </div>

          <article className="prose prose-slate mx-auto max-w-3xl dark:prose-invert">
            <div className="mb-8 flex flex-col gap-2">
              <span className="inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                {article.category}
              </span>
              <h1 className="text-3xl font-bold">{article.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Опубликовано: {formatDate(article.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Просмотров: {article.viewCount}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, "<br />") }} />
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline">Предыдущая статья</Button>
              <Button variant="outline">Следующая статья</Button>
            </div>

            {isAdmin && (
              <div className="mt-8 border-t pt-4">
                <h3 className="mb-2 text-lg font-medium">Инструменты администратора:</h3>
                <div className="flex flex-wrap gap-2">
                  <Link href="/admin/knowledge/editor">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Редактировать
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    Архивировать
                  </Button>
                  <Button variant="outline" size="sm">
                    Статистика просмотров
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Открыть в редакторе
                  </Button>
                </div>
              </div>
            )}
          </article>
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
