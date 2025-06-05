"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import {
  Search,
  User,
  Filter,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  UserPlus,
  Calendar,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { mockTickets, mockUsers, type Ticket } from "@/lib/mock-data"
import { mockAuth } from "@/lib/mock-auth"

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "OPEN":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Открыта
        </Badge>
      )
    case "IN_PROGRESS":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          В работе
        </Badge>
      )
    case "RESOLVED":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Решена
        </Badge>
      )
    case "CLOSED":
      return (
        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
          Закрыта
        </Badge>
      )
    default:
      return <Badge variant="outline">Неизвестно</Badge>
  }
}

// Priority badge component
const PriorityBadge = ({ priority }: { priority: string }) => {
  switch (priority) {
    case "LOW":
      return (
        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
          Низкий
        </Badge>
      )
    case "MEDIUM":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Средний
        </Badge>
      )
    case "HIGH":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Высокий
        </Badge>
      )
    case "CRITICAL":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Критический
        </Badge>
      )
    default:
      return <Badge variant="outline">Неизвестно</Badge>
  }
}

// Status icon component
const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "OPEN":
      return <AlertCircle className="h-5 w-5 text-blue-600" />
    case "IN_PROGRESS":
      return <Loader2 className="h-5 w-5 text-amber-600" />
    case "RESOLVED":
    case "CLOSED":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />
    default:
      return <Clock className="h-5 w-5 text-slate-600" />
  }
}

export default function RequestsPage() {
  const { toast } = useToast()
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [ticketsData, setTicketsData] = useState<Ticket[]>(mockTickets)
  const [showCommentForm, setShowCommentForm] = useState<string | null>(null)
  const commentRef = useRef<HTMLTextAreaElement>(null)

  const currentUser = mockAuth.getCurrentUser()

  if (!currentUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Требуется авторизация</h2>
          <p className="text-muted-foreground mb-4">Для просмотра заявок необходимо войти в систему</p>
          <Link href="/auth/login">
            <Button>Войти в систему</Button>
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
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const toggleTicketExpand = (ticketId: string) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId)
    setShowCommentForm(null)
  }

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    const updatedTickets = ticketsData.map((ticket) => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status: newStatus as any,
          resolvedAt: newStatus === "RESOLVED" ? new Date().toISOString() : ticket.resolvedAt,
        }
      }
      return ticket
    })

    setTicketsData(updatedTickets)

    const statusNames = {
      OPEN: "Открыта",
      IN_PROGRESS: "В работе",
      RESOLVED: "Решена",
      CLOSED: "Закрыта",
    }

    toast({
      title: "Статус заявки изменен",
      description: `Заявка ${ticketId} теперь имеет статус "${statusNames[newStatus as keyof typeof statusNames]}"`,
    })
  }

  const handleAssignTechnician = (ticketId: string, technicianId: string) => {
    const technician = mockUsers.find((u) => u.id === technicianId)
    if (!technician) return

    const updatedTickets = ticketsData.map((ticket) => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          assignee: technician,
          status: ticket.status === "OPEN" ? ("IN_PROGRESS" as const) : ticket.status,
        }
      }
      return ticket
    })

    setTicketsData(updatedTickets)

    toast({
      title: "Исполнитель назначен",
      description: `Заявка ${ticketId} назначена на специалиста: ${technician.name}`,
    })
  }

  const toggleCommentForm = (ticketId: string) => {
    setShowCommentForm(showCommentForm === ticketId ? null : ticketId)
  }

  const addComment = (ticketId: string) => {
    if (!commentRef.current?.value.trim()) {
      toast({
        title: "Ошибка",
        description: "Комментарий не может быть пустым",
        variant: "destructive",
      })
      return
    }

    const updatedTickets = ticketsData.map((ticket) => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          comments: [
            ...ticket.comments,
            {
              id: `comment${Date.now()}`,
              content: commentRef.current?.value || "",
              createdAt: new Date().toISOString(),
              author: currentUser,
            },
          ],
        }
      }
      return ticket
    })

    setTicketsData(updatedTickets)
    setShowCommentForm(null)

    toast({
      title: "Комментарий добавлен",
      description: `Комментарий к заявке ${ticketId} успешно добавлен`,
    })

    if (commentRef.current) {
      commentRef.current.value = ""
    }
  }

  // Filter tickets based on active tab
  const filteredTickets = ticketsData.filter((ticket) => {
    if (activeTab === "all") return true
    return ticket.status === activeTab.toUpperCase()
  })

  const isAdmin = mockAuth.isAdmin()
  const isTechnician = mockAuth.isTechnician()

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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{currentUser.name}</span>
              <Link href="/profile" aria-label="Профиль">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isAdmin || isTechnician ? "Управление заявками" : "Мои заявки"}
              </h1>
              <p className="text-muted-foreground">
                {isAdmin || isTechnician
                  ? "Обработка и назначение заявок на техническую поддержку"
                  : "Просмотр статуса ваших заявок"}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Поиск заявок..." className="pl-9 w-full sm:w-[250px]" />
              </div>
              <Link href="/">
                <Button>Создать заявку</Button>
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto">
                  <TabsTrigger value="all">Все</TabsTrigger>
                  <TabsTrigger value="open">Открытые</TabsTrigger>
                  <TabsTrigger value="in_progress">В работе</TabsTrigger>
                  <TabsTrigger value="resolved">Решенные</TabsTrigger>
                  <TabsTrigger value="closed">Закрытые</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <Filter className="mr-2 h-4 w-4" />
                  Фильтр
                </Button>
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Сортировка
                </Button>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Сначала новые</SelectItem>
                    <SelectItem value="oldest">Сначала старые</SelectItem>
                    <SelectItem value="priority">По приоритету</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <Card key={ticket.id} className="overflow-hidden">
                    <div
                      className="flex cursor-pointer items-center justify-between p-4 hover:bg-muted/50"
                      onClick={() => toggleTicketExpand(ticket.id)}
                    >
                      <div className="flex items-center gap-3">
                        <StatusIcon status={ticket.status} />
                        <div>
                          <div className="font-medium">{ticket.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {ticket.id} • {formatDate(ticket.createdAt)} • {ticket.creator.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-2">
                          <StatusBadge status={ticket.status} />
                          <PriorityBadge priority={ticket.priority} />
                          {ticket.assignee ? (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {ticket.assignee.name}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Не назначено
                            </Badge>
                          )}
                        </div>
                        {expandedTicket === ticket.id ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {expandedTicket === ticket.id && (
                      <CardContent className="border-t pt-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <h3 className="mb-3 font-medium">Информация о заявке</h3>
                            <dl className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Статус:</dt>
                                <dd>
                                  <StatusBadge status={ticket.status} />
                                </dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Приоритет:</dt>
                                <dd>
                                  <PriorityBadge priority={ticket.priority} />
                                </dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Дата создания:</dt>
                                <dd>{formatDate(ticket.createdAt)}</dd>
                              </div>
                              {ticket.resolvedAt && (
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Дата решения:</dt>
                                  <dd>{formatDate(ticket.resolvedAt)}</dd>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Отдел:</dt>
                                <dd>{ticket.department || "Не указан"}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Тип оборудования:</dt>
                                <dd>
                                  {ticket.equipmentType === "computer"
                                    ? "Компьютер/Ноутбук"
                                    : ticket.equipmentType === "printer"
                                      ? "Принтер/МФУ"
                                      : ticket.equipmentType === "network"
                                        ? "Сетевое оборудование"
                                        : ticket.equipmentType === "software"
                                          ? "Программное обеспечение"
                                          : "Другое"}
                                </dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Местоположение:</dt>
                                <dd>{ticket.location || "Не указано"}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Исполнитель:</dt>
                                <dd>{ticket.assignee ? ticket.assignee.name : "Не назначен"}</dd>
                              </div>
                            </dl>

                            <h3 className="mt-6 mb-3 font-medium">Информация о заявителе</h3>
                            <dl className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">ФИО:</dt>
                                <dd>{ticket.creator.name}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Email:</dt>
                                <dd>{ticket.creator.email}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Отдел:</dt>
                                <dd>{ticket.creator.department || "Не указан"}</dd>
                              </div>
                            </dl>
                          </div>

                          <div>
                            <h3 className="mb-3 font-medium">Описание проблемы</h3>
                            <p className="text-sm mb-6">{ticket.description}</p>

                            <h3 className="mb-3 font-medium flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Комментарии ({ticket.comments.length})
                            </h3>

                            {ticket.comments.length > 0 ? (
                              <div className="space-y-4 mb-4">
                                {ticket.comments.map((comment) => (
                                  <div key={comment.id} className="rounded-lg border p-3 text-sm">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarFallback>
                                            {comment.author.name
                                              .split(" ")
                                              .map((n) => n[0])
                                              .join("")}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{comment.author.name}</span>
                                      </div>
                                      <div className="flex items-center text-xs text-muted-foreground">
                                        <Calendar className="mr-1 h-3 w-3" />
                                        {formatDate(comment.createdAt)}
                                      </div>
                                    </div>
                                    <p>{comment.content}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground mb-4">Комментариев пока нет</p>
                            )}

                            {showCommentForm === ticket.id ? (
                              <div className="space-y-3">
                                <Textarea
                                  ref={commentRef}
                                  placeholder="Введите комментарий..."
                                  className="min-h-[100px]"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" onClick={() => setShowCommentForm(null)}>
                                    Отмена
                                  </Button>
                                  <Button size="sm" onClick={() => addComment(ticket.id)}>
                                    Добавить комментарий
                                  </Button>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-2">
                          {(isAdmin || isTechnician) && (
                            <>
                              {/* Status change dropdown */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline">Изменить статус</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {ticket.status !== "OPEN" && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, "OPEN")}>
                                      Открыта
                                    </DropdownMenuItem>
                                  )}
                                  {ticket.status !== "IN_PROGRESS" && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, "IN_PROGRESS")}>
                                      В работе
                                    </DropdownMenuItem>
                                  )}
                                  {ticket.status !== "RESOLVED" && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, "RESOLVED")}>
                                      Решена
                                    </DropdownMenuItem>
                                  )}
                                  {ticket.status !== "CLOSED" && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, "CLOSED")}>
                                      Закрыта
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>

                              {/* Assign technician dropdown */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    {ticket.assignee ? "Переназначить" : "Назначить исполнителя"}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {mockUsers
                                    .filter((user) => user.role === "TECHNICIAN" || user.role === "ADMIN")
                                    .map((tech) => (
                                      <DropdownMenuItem
                                        key={tech.id}
                                        onClick={() => handleAssignTechnician(ticket.id, tech.id)}
                                      >
                                        {tech.name}
                                      </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          )}

                          {/* Comment button */}
                          <Button onClick={() => toggleCommentForm(ticket.id)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Комментировать
                          </Button>

                          {/* More actions dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Скачать детали</DropdownMenuItem>
                              <DropdownMenuItem>Отправить по почте</DropdownMenuItem>
                              <DropdownMenuItem>Печать</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Заявки не найдены</h3>
                  <p className="mb-4 text-muted-foreground">
                    В выбранной категории нет заявок или они не соответствуют критериям поиска.
                  </p>
                  <Button asChild>
                    <Link href="/">Создать новую заявку</Link>
                  </Button>
                </Card>
              )}
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
