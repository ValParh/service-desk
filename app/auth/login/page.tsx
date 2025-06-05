"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { mockAuth } from "@/lib/mock-auth"

export default function LoginPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "petrov@company.com", // Предзаполнено для демо
    password: "password",
    remember: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, remember: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await mockAuth.login(formData.email, formData.password)

      if (result.success) {
        toast({
          title: "Вход выполнен",
          description: `Добро пожаловать, ${result.user?.name}!`,
        })
        router.push("/")
      } else {
        toast({
          title: "Ошибка входа",
          description: result.error || "Неверный email или пароль",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при входе. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Link href="/" className="mb-8 text-2xl font-bold">
        Центр сервисной поддержки
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Вход в систему</CardTitle>
          <CardDescription className="text-center">Введите ваши учетные данные для входа</CardDescription>
          <div className="mt-4 p-3 bg-muted rounded-md text-sm">
            <p className="font-medium mb-2">Демо-аккаунты:</p>
            <div className="space-y-1 text-xs">
              <p>
                <strong>Админ:</strong> petrov@company.com
              </p>
              <p>
                <strong>Техник:</strong> sidorova@company.com
              </p>
              <p>
                <strong>Пользователь:</strong> kozlov@company.com
              </p>
              <p className="text-muted-foreground mt-2">Пароль: любой</p>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Электронная почта</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  className="pl-9"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Пароль</Label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                  Забыли пароль?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-9 pr-9"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" checked={formData.remember} onCheckedChange={handleCheckboxChange} />
              <Label htmlFor="remember" className="text-sm font-normal">
                Запомнить меня
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Выполняется вход..." : "Войти"}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Нет учетной записи?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Зарегистрироваться
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Центр сервисной поддержки. Все права защищены.</p>
        <div className="mt-2 flex justify-center space-x-4">
          <Link href="/" className="hover:underline">
            Главная
          </Link>
          <Link href="/knowledge" className="hover:underline">
            База знаний
          </Link>
          <Link href="/contact" className="hover:underline">
            Контакты
          </Link>
        </div>
      </div>
    </div>
  )
}
