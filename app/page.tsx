"use client"

import type React from "react"

import Link from "next/link"
import { Search, User } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function ServiceDesk() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    location: "",
    equipmentType: "",
    priority: "MEDIUM",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Имитация отправки заявки
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Заявка отправлена",
        description: "Ваша заявка успешно отправлена и будет обработана в ближайшее время.",
      })

      // Очищаем форму
      setFormData({
        title: "",
        description: "",
        department: "",
        location: "",
        equipmentType: "",
        priority: "MEDIUM",
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
        <section className="container py-10 md:py-12 lg:py-16">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
              Добро пожаловать в центр сервисной поддержки
            </h1>
            <div className="w-full max-w-[750px] pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input type="search" placeholder="В чем требуется помощь?" className="w-full pl-10" />
              </div>
            </div>
          </div>
        </section>
        <section className="container pb-12 md:pb-16 lg:pb-20">
          <Card className="mx-auto max-w-[850px]">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Создание заявки</CardTitle>
                <CardDescription>
                  Заполните форму для создания заявки на техническую поддержку или ремонт оргтехники
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Заголовок заявки</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Кратко опишите проблему"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Приоритет</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Выберите приоритет" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Низкий</SelectItem>
                        <SelectItem value="MEDIUM">Средний</SelectItem>
                        <SelectItem value="HIGH">Высокий</SelectItem>
                        <SelectItem value="CRITICAL">Критический</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="department">Отдел/Подразделение</Label>
                    <Input
                      id="department"
                      name="department"
                      placeholder="Укажите ваш отдел"
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Местоположение</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="Кабинет/Этаж/Здание"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipmentType">Тип оборудования</Label>
                  <Select
                    value={formData.equipmentType}
                    onValueChange={(value) => handleSelectChange("equipmentType", value)}
                  >
                    <SelectTrigger id="equipmentType">
                      <SelectValue placeholder="Выберите тип оборудования" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="computer">Компьютер/Ноутбук</SelectItem>
                      <SelectItem value="printer">Принтер/МФУ</SelectItem>
                      <SelectItem value="network">Сетевое оборудование</SelectItem>
                      <SelectItem value="phone">Телефон</SelectItem>
                      <SelectItem value="software">Программное обеспечение</SelectItem>
                      <SelectItem value="other">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Описание проблемы</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Подробно опишите проблему, с которой вы столкнулись"
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Прикрепить файл (опционально)</Label>
                  <Input id="file" type="file" />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="ml-auto" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Отправка..." : "Отправить заявку"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </section>
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
