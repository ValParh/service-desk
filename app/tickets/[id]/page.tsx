"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Send, UserPlus, User, Calendar, Phone, Mail, Tag } from "lucide-react"
import Link from "next/link"
import { dataStore, type Ticket, type TicketComment } from "@/lib/data-store"

const statusOptions = [
  { value: "new", label: "Новая", color: "bg-blue-100 text-blue-800" },
  { value: "in-progress", label: "В работе", color: "bg-yellow-100 text-yellow-800" },
  { value: "resolved", label: "Решена", color: "bg-green-100 text-green-800" },
  { value: "closed", label: "Закрыта", color: "bg-gray-100 text-gray-800" },
]

const priorityOptions = [
  { value: "low", label: "Низкий", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Средний", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "Высокий", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "Срочный", color: "bg-red-100 text-red-800" },
]

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [comments, setComments] = useState<TicketComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [canTakeTicket, setCanTakeTicket] = useState(false)

  const ticketId = params.id as string

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    loadTicket()
  }, [user, ticketId])

  const loadTicket = () => {
    const foundTicket = dataStore.getTickets().find((t) => t.id === ticketId)
    if (foundTicket) {
      setTicket(foundTicket)
      setComments(foundTicket.comments || [])

      // Обновленная логика проверки возможности взять заявку
      const canTake =
        user &&
        (user.role === "support" || user.role === "admin") &&
        foundTicket.status === "new" &&
        (!foundTicket.assignedTo || foundTicket.assignedTo === null)

      setCanTakeTicket(canTake)
    }
    setIsLoading(false)
  }

  const handleStatusChange = (newStatus: string) => {
    if (!ticket || !user) return

    const updatedTicket = dataStore.updateTicket(ticket.id, { status: newStatus as any })
    if (updatedTicket) {
      setTicket(updatedTicket)
    }
  }

  const handlePriorityChange = (newPriority: string) => {
    if (!ticket || !user) return

    const updatedTicket = dataStore.updateTicket(ticket.id, { priority: newPriority as any })
    if (updatedTicket) {
      setTicket(updatedTicket)
    }
  }

  const handleTakeTicket = () => {
    if (!ticket || !user) return

    const updates = {
      assignedTo: user.id,
      assignedToName: `${user.firstName} ${user.lastName}`,
      status: "in-progress" as const,
    }

    const updatedTicket = dataStore.updateTicket(ticket.id, updates)
    if (updatedTicket) {
      setTicket(updatedTicket)
      setCanTakeTicket(false)
    }
  }

  const handleAddComment = () => {
    if (!ticket || !user || !newComment.trim()) return

    const comment = dataStore.addComment(ticket.id, {
      ticketId: ticket.id,
      authorId: user.id,
      authorName: `${user.firstName} ${user.lastName}`,
      content: newComment,
      isInternal: false,
    })

    if (comment) {
      setComments([...comments, comment])
      setNewComment("")
      loadTicket() // Перезагружаем заявку для обновления времени
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Заявка не найдена</h1>
            <Link href="/tickets">
              <Button>Вернуться к списку заявок</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentStatus = statusOptions.find((s) => s.value === ticket.status)
  const currentPriority = priorityOptions.find((p) => p.value === ticket.priority)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/tickets">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к заявкам
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-sm">
                        {ticket.id}
                      </Badge>
                      {currentStatus && <Badge className={currentStatus.color}>{currentStatus.label}</Badge>}
                      {currentPriority && <Badge className={currentPriority.color}>{currentPriority.label}</Badge>}
                    </div>
                    <CardTitle className="text-2xl">{ticket.title}</CardTitle>
                  </div>

                  {canTakeTicket && (
                    <Button onClick={handleTakeTicket} className="bg-orange-500 hover:bg-orange-600 text-white">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Взять в работу
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Описание проблемы</h3>
                    <p className="text-gray-700">{ticket.description}</p>
                  </div>
                  {canTakeTicket && (
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        onClick={handleTakeTicket}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        size="lg"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Взять в работу
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Комментарии */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Комментарии ({comments.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Комментариев пока нет</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="border-l-4 border-orange-200 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.authorName}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleString("ru-RU")}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))
                  )}

                  {/* Добавить комментарий */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Добавить комментарий</h4>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Введите ваш комментарий..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={handleAddComment} className="bg-orange-500 hover:bg-orange-600">
                        <Send className="w-4 h-4 mr-2" />
                        Отправить комментарий
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Информация о заявке */}
            <Card>
              <CardHeader>
                <CardTitle>Информация о заявке</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Создано:</span>
                  <span>{new Date(ticket.createdAt).toLocaleString("ru-RU")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Обновлено:</span>
                  <span>{new Date(ticket.updatedAt).toLocaleString("ru-RU")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Исполнитель:</span>
                  <span>{ticket.assignedToName || "Не назначен"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Контактная информация */}
            <Card>
              <CardHeader>
                <CardTitle>Контактная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Имя:</span>
                  <p className="font-medium">{ticket.clientName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Email:</span>
                  <a href={`mailto:${ticket.clientEmail}`} className="text-orange-600 hover:text-orange-700">
                    {ticket.clientEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Телефон:</span>
                  <a href={`tel:${ticket.clientPhone}`} className="text-orange-600 hover:text-orange-700">
                    {ticket.clientPhone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Категория:</span>
                  <span>{ticket.category}</span>
                </div>
              </CardContent>
            </Card>

            {/* Управление заявкой */}
            {(user?.role === "support" || user?.role === "admin") && (
              <Card>
                <CardHeader>
                  <CardTitle>Управление заявкой</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Статус</label>
                    <Select value={ticket.status} onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Приоритет</label>
                    <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full bg-orange-500 hover:bg-orange-600">Сохранить изменения</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
