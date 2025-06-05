import Link from "next/link"
import { Search, User, FileText, ArrowRight, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { mockArticles } from "@/lib/mock-data"
import { mockAuth } from "@/lib/mock-auth"

export default function KnowledgeBasePage() {
  const currentUser = mockAuth.getCurrentUser()
  const isAdmin = mockAuth.isAdmin()

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
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">База знаний</h1>
              <p className="text-muted-foreground">Найдите ответы на часто задаваемые вопросы и инструкции</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Поиск по базе знаний..." className="w-full pl-9 md:w-[300px]" />
              </div>
              {isAdmin && (
                <Link href="/admin/knowledge/editor">
                  <Button className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Создать статью
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {mockArticles.map((article) => (
              <Link key={article.id} href={`/knowledge/${article.slug}`}>
                <Card className="h-full transition-all hover:border-primary hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                        {article.category}
                      </span>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{article.content.substring(0, 100).replace(/[#*]/g, "")}...</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center text-sm text-primary">
                      Читать статью
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button variant="outline" disabled>
              Страница 1 из 1
            </Button>
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
