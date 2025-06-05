"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Building, Check, Eye, EyeOff, Lock, Mail, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { registerUser } from "@/actions/auth"

const departments = [
  "Администрация",
  "Бухгалтерия",
  "IT отдел",
  "Маркетинг",
  "Отдел продаж",
  "Отдел кадров",
  "Производство",
  "Логистика",
  "Другое",
]

export default function RegisterPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
    department: "",
    position: "",
    location: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const nextStep = () => {
    if (step === 1) {
      // Валидация первого шага
      const stepErrors: Record<string, string> = {}
      if (!formData.firstName) stepErrors.firstName = "Имя обязательно"
      if (!formData.lastName) stepErrors.lastName = "Фамилия обязательна"
      if (!formData.email) stepErrors.email = "Email обязателен"
      else if (!/\S+@\S+\.\S+/.test(formData.email)) stepErrors.email = "Некорректный email"

      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors)
        return
      }
    } else if (step === 2) {
      // Валидация второго шага
      const stepErrors: Record<string, string> = {}
      if (!formData.password) stepErrors.password = "Пароль обязателен"
      else if (formData.password.length < 8) stepErrors.password = "Пароль должен содержать минимум 8 символов"

      if (!formData.confirmPassword) stepErrors.confirmPassword = "Подтвердите пароль"
      else if (formData.password !== formData.confirmPassword) stepErrors.confirmPassword = "Пароли не совпадают"

      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors)
        return
      }
    }

    setErrors({})
    setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Валидация третьего шага
    const stepErrors: Record<string, string> = {}
    if (!formData.organization) stepErrors.organization = "Организация обязательна"
    if (!formData.department) stepErrors.department = "Отдел обязателен"
    if (!formData.position) stepErrors.position = "Должность обязательна"

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }

    setIsLoading(true)

    // Создаем FormData для отправки
    const submitData = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "confirmPassword") {
        // Не отправляем подтверждение пароля
        submitData.append(key, value)
      }
    })

    try {
      const result = await registerUser(submitData)

      if (result?.error) {
        toast({
          title: "Ошибка регистрации",
          description: result.error,
          variant: "destructive",
        })

        // Если есть детали ошибок по полям
        if (result.details) {
          const fieldErrors: Record<string, string> = {}
          Object.entries(result.details).forEach(([key, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              fieldErrors[key] = messages[0]
            }
          })
          setErrors(fieldErrors)
        }
      } else {
        // Успешная регистрация
        toast({
          title: "Регистрация успешна",
          description: "Ваша учетная запись создана. Теперь вы можете войти в систему.",
        })
        router.push("/auth/login?registered=true")
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при регистрации. Пожалуйста, попробуйте снова.",
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
          <CardTitle className="text-2xl font-bold text-center">Регистрация</CardTitle>
          <CardDescription className="text-center">Создайте учетную запись для доступа к системе</CardDescription>
          <div className="flex justify-center space-x-1 pt-2">
            <div className={`h-2 w-8 rounded ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-2 w-8 rounded ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-2 w-8 rounded ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Фамилия</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Иванов"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={errors.lastName}
                    />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Имя</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Иван"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={errors.firstName}
                    />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Отчество</Label>
                  <Input
                    id="middleName"
                    name="middleName"
                    placeholder="Иванович"
                    value={formData.middleName}
                    onChange={handleChange}
                  />
                </div>
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
                      error={errors.email}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="pl-9 pr-9"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
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
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  <p className="text-xs text-muted-foreground">
                    Пароль должен содержать не менее 8 символов, включая буквы, цифры и специальные символы
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className="pl-9 pr-9"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10 text-muted-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="organization">Организация</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="organization"
                      name="organization"
                      placeholder="ООО Компания"
                      className="pl-9"
                      value={formData.organization}
                      onChange={handleChange}
                      error={errors.organization}
                    />
                  </div>
                  {errors.organization && <p className="text-xs text-destructive">{errors.organization}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Отдел</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleSelectChange("department", value)}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Выберите отдел" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Должность</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="position"
                      name="position"
                      placeholder="Менеджер"
                      className="pl-9"
                      value={formData.position}
                      onChange={handleChange}
                      error={errors.position}
                    />
                  </div>
                  {errors.position && <p className="text-xs text-destructive">{errors.position}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Местоположение (кабинет)</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="305"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="flex w-full justify-between">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Назад
                </Button>
              ) : (
                <div></div>
              )}

              {step < 3 ? (
                <Button type="button" onClick={nextStep}>
                  Далее
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    "Регистрация..."
                  ) : (
                    <>
                      Зарегистрироваться
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Уже есть учетная запись?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Войти
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
