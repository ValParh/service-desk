"use client"

import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus, ChevronRight, Clock, AlertCircle, CheckCircle2, Trash2, UserPlus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { dataStore, type Ticket } from "@/lib/data-store"
import { useLanguage } from "@/contexts/language-context"

export default function AllTicketsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const { t } = useLanguage()

  useEffect(() => {
    dataStore.init()
    if (!isLoading && !user) {
      router.push("/login")
    }
    if (!isLoading && user && user.role === "client") {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && user.role !== "client") {
      const allTickets = dataStore.getTickets()
      setTickets(allTickets)
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  if (!user || user.role === "client") {
    return null
  }

  const statusTabs = [
    { key: "all", label: t("tickets.allTickets"), count: tickets.length },
    { key: "new", label: t("tickets.openTickets"), count: tickets.filter((t) => t.status === "new").length },
    {
      key: "in-progress",
      label: t("tickets.inProgressTickets"),
      count: tickets.filter((t) => t.status === "in-progress").length,
    },
    {
      key: "resolved",
      label: t("tickets.resolvedTickets"),
      count: tickets.filter((t) => t.status === "resolved").length,
    },
    { key: "closed", label: t("tickets.closedTickets"), count: tickets.filter((t) => t.status === "closed").length },
  ]

  const getStatusText = (status: string) => {
    return t(`status.${status}`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return AlertCircle
      case "in-progress":
        return Clock
      case "resolved":
      case "closed":
        return CheckCircle2
      default:
        return AlertCircle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "text-blue-600"
      case "in-progress":
        return "text-yellow-600"
      case "resolved":
        return "text-green-600"
      case "closed":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityText = (priority: string) => {
    return t(`priority.${priority}`)
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "priority":
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        return (
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
        )
      case "status":
        return a.status.localeCompare(b.status)
      default:
        return 0
    }
  })

  const handleDeleteTicket = (ticketId: string) => {
    if (confirm("Вы уверены, что хотите удалить эту заявку? Это действие нельзя отменить.")) {
      dataStore.deleteTicket(ticketId)
      const updatedTickets = dataStore.getTickets()
      setTickets(updatedTickets)
    }
  }

  const handleTakeTicket = (ticketId: string) => {
    if (user && (user.role === "support" || user.role === "admin")) {
      const updates = {
        assignedTo: user.id,
        assignedToName: `${user.firstName} ${user.lastName}`,
        status: "in-progress" as const,
      }

      const updatedTicket = dataStore.updateTicket(ticketId, updates)
      if (updatedTicket) {
        // Обновляем локальное состояние
        const updatedTickets = dataStore.getTickets()
        setTickets(updatedTickets)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("tickets.title")}</h1>
            <p className="text-gray-600 mt-2">{t("tickets.subtitle")}</p>
          </div>
          <Link href="/tickets/new">
            <Button className="bg-gray-900 hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              {t("tickets.createTicket")}
            </Button>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t("tickets.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Фильтр
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("tickets.sortNewest")}</SelectItem>
                <SelectItem value="oldest">{t("tickets.sortOldest")}</SelectItem>
                <SelectItem value="priority">{t("tickets.sortPriority")}</SelectItem>
                <SelectItem value="status">{t("tickets.sortStatus")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex space-x-1 mb-6 border-b">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                statusFilter === tab.key
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {sortedTickets.map((ticket) => {
            const StatusIcon = getStatusIcon(ticket.status)
            const canTakeTicket =
              user &&
              (user.role === "support" || user.role === "admin") &&
              ticket.status === "new" &&
              !ticket.assignedTo

            return (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <StatusIcon className={`w-5 h-5 mt-1 ${getStatusColor(ticket.status)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {getPriorityText(ticket.priority)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(ticket.status).replace("text-", "text-")} border-current`}
                          >
                            {getStatusText(ticket.status)}
                          </Badge>
                          {ticket.assignedToName && (
                            <span className="text-sm text-gray-500">Назначено: {ticket.assignedToName}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {ticket.id} • {new Date(ticket.createdAt).toLocaleString("ru-RU")} • {ticket.clientName}
                        </p>
                        <p className="text-gray-700">{ticket.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {canTakeTicket && (
                        <Button
                          onClick={() => handleTakeTicket(ticket.id)}
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Взять в работу
                        </Button>
                      )}
                      <Link href={`/tickets/${ticket.id}`}>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                      {user.role === "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {sortedTickets.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">{t("tickets.noTickets")}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
