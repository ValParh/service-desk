"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { dataStore } from "@/lib/data-store"
import { useLanguage } from "@/contexts/language-context"

export default function NewTicketPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
  })

  const { t } = useLanguage()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.category) {
      alert("Пожалуйста, заполните все обязательные поля")
      return
    }

    setIsSubmitting(true)

    try {
      // Инициализируем dataStore
      dataStore.init()

      // Создаем новую заявку
      const newTicket = dataStore.addTicket({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority as "low" | "medium" | "high" | "urgent",
        status: "new",
        clientId: user.id,
        clientName: `${user.firstName} ${user.lastName}`,
        clientEmail: user.email,
        clientPhone: user.phone,
      })

      console.log("Создана новая заявка:", newTicket)

      // Создаем уведомление для администраторов
      dataStore.addNotification({
        userId: "all", // Для всех администраторов
        type: "ticket_created",
        title: "Новая заявка",
        message: `Создана новая заявка: ${formData.title}`,
        relatedId: newTicket.id,
      })

      // Перенаправляем на страницу заявок
      router.push("/my-tickets")
    } catch (error) {
      console.error("Ошибка при создании заявки:", error)
      alert("Произошла ошибка при создании заявки")
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [
    { value: "technical", label: t("category.technical") },
    { value: "account", label: t("category.account") },
    { value: "billing", label: t("category.billing") },
    { value: "feature", label: t("category.feature") },
    { value: "other", label: t("category.other") },
  ]

  const priorities = [
    { value: "low", label: t("priority.low") },
    { value: "medium", label: t("priority.medium") },
    { value: "high", label: t("priority.high") },
    { value: "urgent", label: t("priority.urgent") },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/my-tickets">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("tickets.backToTickets")}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t("tickets.newTicketTitle")}</h1>
          <p className="text-gray-600 mt-2">{t("tickets.newTicketSubtitle")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("tickets.ticketInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t("tickets.ticketTitle")} *</Label>
                <Input
                  id="title"
                  placeholder={t("tickets.ticketTitlePlaceholder")}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("tickets.description")} *</Label>
                <Textarea
                  id="description"
                  placeholder={t("tickets.descriptionPlaceholder")}
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">{t("tickets.category")} *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("tickets.selectCategory")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">{t("tickets.priority")}</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">{t("tickets.contactInfo")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">{t("tickets.name")}:</span> {user.firstName} {user.lastName}
                  </div>
                  <div>
                    <span className="font-medium">{t("tickets.email")}:</span> {user.email}
                  </div>
                  <div>
                    <span className="font-medium">{t("tickets.phone")}:</span> {user.phone}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/my-tickets">
                  <Button type="button" variant="outline">
                    {t("common.cancel")}
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600">
                  {isSubmitting ? (
                    t("tickets.creating")
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t("tickets.createTicket")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
