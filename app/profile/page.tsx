"use client"

import type React from "react"

import Link from "next/link"
import { ArrowLeft, User } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate saving
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Сохранено",
        description: "Ваши данные успешно сохранены.",
      })
    }, 1000)
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
          <Link
            href="/"
            className="mb-6 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться на главную
          </Link>

          <Card className="mx-auto max-w-[850px]">
            <form onSubmit={handleSave}>
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-6 w-6" />
                  <CardTitle className="text-2xl">Профиль пользователя</CardTitle>
                </div>
                <CardDescription>Ваша личная информация и контактные данные</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Фамилия</Label>
                    <Input id="lastName" placeholder="Иванов" defaultValue="Иванов" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Имя</Label>
                    <Input id="firstName" placeholder="Иван" defaultValue="Иван" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Отчество</Label>
                    <Input id="middleName" placeholder="Иванович" defaultValue="Иванович" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Дата рождения</Label>
                  <Input id="birthDate" type="date" defaultValue="1990-01-01" required />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Организация</Label>
                    <Input id="organization" placeholder="ООО Компания" defaultValue="ООО Компания" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Филиал</Label>
                    <Input id="branch" placeholder="Головной офис" defaultValue="Головной офис" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="office">Кабинет</Label>
                  <Input id="office" placeholder="305" defaultValue="305" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="ml-auto" disabled={isSaving}>
                  {isSaving ? "Сохранение..." : "Сохранить изменения"}
                </Button>
              </CardFooter>
            </form>
          </Card>
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
          </div>
        </div>
      </footer>
    </div>
  )
}
