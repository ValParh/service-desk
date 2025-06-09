"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import { User, Building, Shield, Globe } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import Image from "next/image"
import { dataStore } from "@/lib/data-store"

export default function RegisterPage() {
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    // Шаг 1: Личная информация
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    birthDate: "",

    // Шаг 2: Рабочая информация
    department: "",
    position: "",
    employeeId: "",
    manager: "",
    workLocation: "",
    startDate: "",

    // Шаг 3: Доступ и безопасность
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
    additionalInfo: "",
    agreeToTerms: false,
  })

  const steps = [
    {
      number: 1,
      title: t("register.personalInfo"),
      description: t("register.personalInfoDesc"),
      icon: User,
    },
    {
      number: 2,
      title: t("register.workInfo"),
      description: t("register.workInfoDesc"),
      icon: Building,
    },
    {
      number: 3,
      title: t("register.security"),
      description: t("register.securityDesc"),
      icon: Shield,
    },
  ]

  const departments = [
    t("departments.it"),
    t("departments.sales"),
    t("departments.purchasing"),
    t("departments.support"),
    t("departments.accounting"),
    t("departments.hr"),
    t("departments.marketing"),
    t("departments.legal"),
    t("departments.production"),
    t("departments.logistics"),
  ]

  const securityQuestions = [
    t("securityQuestions.pet"),
    t("securityQuestions.city"),
    t("securityQuestions.friend"),
    t("securityQuestions.car"),
    t("securityQuestions.school"),
  ]

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = t("validation.firstNameRequired")
      if (!formData.lastName.trim()) newErrors.lastName = t("validation.lastNameRequired")
      if (!formData.email.trim()) newErrors.email = t("validation.emailRequired")
      if (!formData.phone.trim()) newErrors.phone = t("validation.phoneRequired")
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = t("validation.invalidEmail")
      }

      // Проверяем уникальность email
      const existingUsers = dataStore.getUsers()
      const pendingUsers = dataStore.getPendingUsers()
      if (
        existingUsers.some((u) => u.email === formData.email) ||
        pendingUsers.some((u) => u.email === formData.email)
      ) {
        newErrors.email = t("validation.emailExists")
      }
    }

    if (step === 2) {
      if (!formData.department) newErrors.department = t("validation.departmentRequired")
      if (!formData.position.trim()) newErrors.position = t("validation.positionRequired")
      if (!formData.employeeId.trim()) newErrors.employeeId = t("validation.employeeIdRequired")
      if (!formData.workLocation.trim()) newErrors.workLocation = t("validation.workLocationRequired")
    }

    if (step === 3) {
      if (!formData.password) newErrors.password = t("validation.passwordRequired")
      if (formData.password.length < 8) newErrors.password = t("validation.passwordLength")
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t("validation.passwordsNotMatch")
      }
      if (!formData.securityQuestion) newErrors.securityQuestion = t("validation.securityQuestionRequired")
      if (!formData.securityAnswer.trim()) newErrors.securityAnswer = t("validation.securityAnswerRequired")
      if (!formData.agreeToTerms) newErrors.agreeToTerms = t("validation.termsRequired")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
    setErrors({})
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)

    try {
      // Инициализируем хранилище
      dataStore.init()

      // Добавляем пользователя в ожидающие регистрации
      const pendingUser = dataStore.addPendingUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        email: formData.email,
        phone: formData.phone,
        birthDate: formData.birthDate,
        department: formData.department,
        position: formData.position,
        employeeId: formData.employeeId,
        manager: formData.manager,
        workLocation: formData.workLocation,
        startDate: formData.startDate,
        password: formData.password, // В реальном приложении пароль должен быть захеширован
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer,
        additionalInfo: formData.additionalInfo,
      })

      if (pendingUser) {
        setIsCompleted(true)
      }
    } catch (error) {
      console.error("Ошибка регистрации:", error)
      alert(t("messages.error"))
    }

    setIsSubmitting(false)
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex justify-center">
              <Image src="/logo.png" alt="Т Плюс" width={180} height={48} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Help Desk</h1>
            <p className="text-gray-600">{t("register.systemDescription")}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">{t("register.completed")}</CardTitle>
              <CardDescription className="text-center">{t("register.requestSent")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t("register.thankYou")}</h3>
                <p className="text-gray-600 mb-6">{t("register.requestReview")}</p>
                <Link href="/login">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">{t("register.backToLogin")}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("register.lastName")} *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("register.firstName")} *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName">{t("register.middleName")}</Label>
              <Input
                id="middleName"
                value={formData.middleName}
                onChange={(e) => updateFormData("middleName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("register.email")} *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("register.phone")} *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">{t("register.birthDate")}</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => updateFormData("birthDate", e.target.value)}
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="department">{t("register.department")} *</Label>
              <Select value={formData.department} onValueChange={(value) => updateFormData("department", value)}>
                <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("register.selectDepartment")} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">{t("register.position")} *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => updateFormData("position", e.target.value)}
                className={errors.position ? "border-red-500" : ""}
              />
              {errors.position && <p className="text-sm text-red-500">{errors.position}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId">{t("register.employeeId")} *</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => updateFormData("employeeId", e.target.value)}
                className={errors.employeeId ? "border-red-500" : ""}
              />
              {errors.employeeId && <p className="text-sm text-red-500">{errors.employeeId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager">{t("register.manager")}</Label>
              <Input
                id="manager"
                value={formData.manager}
                onChange={(e) => updateFormData("manager", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workLocation">{t("register.workLocation")} *</Label>
              <Input
                id="workLocation"
                value={formData.workLocation}
                onChange={(e) => updateFormData("workLocation", e.target.value)}
                className={errors.workLocation ? "border-red-500" : ""}
              />
              {errors.workLocation && <p className="text-sm text-red-500">{errors.workLocation}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">{t("register.startDate")}</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData("startDate", e.target.value)}
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t("register.password")} *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData("password", e.target.value)}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("register.confirmPassword")} *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityQuestion">{t("register.securityQuestion")} *</Label>
              <Select
                value={formData.securityQuestion}
                onValueChange={(value) => updateFormData("securityQuestion", value)}
              >
                <SelectTrigger className={errors.securityQuestion ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("register.selectSecurityQuestion")} />
                </SelectTrigger>
                <SelectContent>
                  {securityQuestions.map((question) => (
                    <SelectItem key={question} value={question}>
                      {question}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.securityQuestion && <p className="text-sm text-red-500">{errors.securityQuestion}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityAnswer">{t("register.securityAnswer")} *</Label>
              <Input
                id="securityAnswer"
                value={formData.securityAnswer}
                onChange={(e) => updateFormData("securityAnswer", e.target.value)}
                className={errors.securityAnswer ? "border-red-500" : ""}
              />
              {errors.securityAnswer && <p className="text-sm text-red-500">{errors.securityAnswer}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">{t("register.additionalInfo")}</Label>
              <Input
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => updateFormData("additionalInfo", e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => updateFormData("agreeToTerms", Boolean(checked))}
              />
              <Label htmlFor="agreeToTerms" className={`text-sm ${errors.agreeToTerms ? "text-red-500" : ""}`}>
                {t("register.agreeToTerms")}
              </Label>
            </div>
            {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms}</p>}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex justify-center">
            <Image src="/logo.png" alt="Т Плюс" width={180} height={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Help Desk</h1>
          <p className="text-gray-600">{t("register.systemDescription")}</p>

          {/* Переключатель языка */}
          <div className="flex items-center justify-center mt-4">
            <Globe className="w-4 h-4 text-gray-500 mr-2" />
            <Select value={language} onValueChange={(value: "ru" | "en") => setLanguage(value)}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("register.title")}</CardTitle>
            <CardDescription>{t("register.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className={`flex flex-col items-center ${
                      currentStep === step.number
                        ? "text-orange-600"
                        : currentStep > step.number
                          ? "text-green-600"
                          : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                        currentStep === step.number
                          ? "bg-orange-100 text-orange-600"
                          : currentStep > step.number
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <step.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs">{step.title}</span>
                  </div>
                ))}
              </div>
              <Progress value={(currentStep / steps.length) * 100} className="h-1" />
            </div>

            {renderStepContent()}

            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={handlePrevious}>
                  {t("common.back")}
                </Button>
              ) : (
                <Link href="/login">
                  <Button variant="outline">{t("common.cancel")}</Button>
                </Link>
              )}

              {currentStep < steps.length ? (
                <Button onClick={handleNext} className="bg-orange-500 hover:bg-orange-600">
                  {t("common.next")}
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>
                  {isSubmitting ? t("register.submitting") : t("register.complete")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {t("register.alreadyHaveAccount")}{" "}
            <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
              {t("register.login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
