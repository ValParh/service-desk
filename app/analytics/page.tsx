"use client"

import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Ticket,
  Clock,
  CheckCircle,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { dataStore } from "@/lib/data-store"
import { useLanguage } from "@/contexts/language-context"

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [timeRange, setTimeRange] = useState("30d")
  const [analytics, setAnalytics] = useState<any>(null)
  const [isExporting, setIsExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const { t, language } = useLanguage()

  useEffect(() => {
    dataStore.init()
    if (!isLoading && !user) {
      router.push("/login")
    }
    if (!isLoading && user && user.role !== "admin") {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && user.role === "admin") {
      calculateAnalytics()
    }
  }, [user, timeRange, language])

  const calculateAnalytics = () => {
    const tickets = dataStore.getTickets()
    const users = dataStore.getUsers()
    const articles = dataStore.getArticles()
    const pendingUsers = dataStore.getPendingUsers()

    // Фильтрация по времени
    const now = new Date()
    const dateFilter = new Date()

    switch (timeRange) {
      case "7d":
        dateFilter.setDate(now.getDate() - 7)
        break
      case "30d":
        dateFilter.setDate(now.getDate() - 30)
        break
      case "90d":
        dateFilter.setDate(now.getDate() - 90)
        break
      case "1y":
        dateFilter.setFullYear(now.getFullYear() - 1)
        break
      default:
        dateFilter.setDate(now.getDate() - 30)
    }

    const filteredTickets = tickets.filter((ticket) => new Date(ticket.createdAt) >= dateFilter)

    // Основная статистика
    const totalTickets = filteredTickets.length
    const newTickets = filteredTickets.filter((t) => t.status === "new").length
    const inProgressTickets = filteredTickets.filter((t) => t.status === "in-progress").length
    const resolvedTickets = filteredTickets.filter((t) => t.status === "resolved").length
    const closedTickets = filteredTickets.filter((t) => t.status === "closed").length

    // Статистика по приоритетам
    const urgentTickets = filteredTickets.filter((t) => t.priority === "urgent").length
    const highTickets = filteredTickets.filter((t) => t.priority === "high").length
    const mediumTickets = filteredTickets.filter((t) => t.priority === "medium").length
    const lowTickets = filteredTickets.filter((t) => t.priority === "low").length

    // Статистика пользователей
    const activeUsers = users.filter((u) => u.isActive).length
    const pendingUsersCount = pendingUsers.length
    const clientUsers = users.filter((u) => u.role === "client").length
    const supportUsers = users.filter((u) => u.role === "support").length
    const adminUsers = users.filter((u) => u.role === "admin").length

    // Топ категории
    const categoryStats: { [key: string]: number } = {}
    filteredTickets.forEach((ticket) => {
      categoryStats[ticket.category] = (categoryStats[ticket.category] || 0) + 1
    })

    const topCategories = Object.entries(categoryStats)
      .map(([category, count]) => ({
        category,
        count,
        percentage: totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Статистика команды поддержки
    const supportTeamStats = users
      .filter((u) => u.role === "support" || u.role === "admin")
      .map((user) => {
        const assignedTickets = tickets.filter((t) => t.assignedTo === user.id)
        const resolvedByUser = assignedTickets.filter((t) => t.status === "resolved" || t.status === "closed")

        return {
          name: `${user.firstName} ${user.lastName}`,
          assigned: assignedTickets.length,
          resolved: resolvedByUser.length,
          efficiency:
            assignedTickets.length > 0 ? Math.round((resolvedByUser.length / assignedTickets.length) * 100) : 0,
          avgTime: "4.2ч",
        }
      })

    // Последняя активность
    const recentActivity = tickets
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
      .map((ticket) => ({
        time: new Date(ticket.updatedAt).toLocaleTimeString(language === "ru" ? "ru-RU" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        event:
          language === "ru"
            ? `${ticket.status === "new" ? "Создан" : "Обновлен"} запрос ${ticket.id}`
            : `${ticket.status === "new" ? "Created" : "Updated"} ticket ${ticket.id}`,
        user: ticket.clientName,
        status: ticket.status,
      }))

    // Статистика базы знаний
    const publishedArticles = articles.filter((a) => a.isPublished)
    const totalViews = publishedArticles.reduce((sum, article) => sum + article.views, 0)
    const totalHelpful = publishedArticles.reduce((sum, article) => sum + article.helpful, 0)
    const totalNotHelpful = publishedArticles.reduce((sum, article) => sum + article.notHelpful, 0)

    // Данные для графиков (последние 7 дней)
    const dailyStats = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayTickets = tickets.filter((t) => new Date(t.createdAt).toDateString() === date.toDateString())
      const dayResolved = tickets.filter(
        (t) =>
          new Date(t.updatedAt).toDateString() === date.toDateString() &&
          (t.status === "resolved" || t.status === "closed"),
      )

      dailyStats.push({
        date: date.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", { day: "2-digit", month: "2-digit" }),
        created: dayTickets.length,
        resolved: dayResolved.length,
      })
    }

    // Расчет изменений (для демонстрации используем случайные значения)
    const getRandomChange = () => {
      const changes = ["+12.5%", "+5.2%", "-8.1%", "+2.3%", "+15.7%", "-3.4%"]
      return changes[Math.floor(Math.random() * changes.length)]
    }

    const stats = [
      {
        title: t("analytics.totalTickets"),
        value: totalTickets.toString(),
        change: getRandomChange(),
        trend: "up",
        icon: Ticket,
        color: "text-blue-600",
      },
      {
        title: t("analytics.activeUsers"),
        value: activeUsers.toString(),
        change: getRandomChange(),
        trend: "up",
        icon: Users,
        color: "text-green-600",
      },
      {
        title: t("analytics.avgResolutionTime"),
        value: "4.2ч",
        change: "-8.1%",
        trend: "down",
        icon: Clock,
        color: "text-orange-600",
      },
      {
        title: t("analytics.teamEfficiency"),
        value:
          supportTeamStats.length > 0
            ? Math.round(
                supportTeamStats.reduce((sum, member) => sum + member.efficiency, 0) / supportTeamStats.length,
              ) + "%"
            : "0%",
        change: "+2.3%",
        trend: "up",
        icon: CheckCircle,
        color: "text-purple-600",
      },
    ]

    setAnalytics({
      stats: stats,
      ticketsByStatus: [
        {
          name: t("status.new"),
          value: newTickets,
          color: "bg-blue-500",
          percentage: totalTickets > 0 ? Math.round((newTickets / totalTickets) * 100) : 0,
        },
        {
          name: t("status.in-progress"),
          value: inProgressTickets,
          color: "bg-yellow-500",
          percentage: totalTickets > 0 ? Math.round((inProgressTickets / totalTickets) * 100) : 0,
        },
        {
          name: t("status.resolved"),
          value: resolvedTickets,
          color: "bg-green-500",
          percentage: totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0,
        },
        {
          name: t("status.closed"),
          value: closedTickets,
          color: "bg-gray-500",
          percentage: totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 0,
        },
      ],
      ticketsByPriority: [
        {
          name: t("priority.urgent"),
          value: urgentTickets,
          color: "bg-red-500",
          percentage: totalTickets > 0 ? Math.round((urgentTickets / totalTickets) * 100) : 0,
        },
        {
          name: t("priority.high"),
          value: highTickets,
          color: "bg-orange-500",
          percentage: totalTickets > 0 ? Math.round((highTickets / totalTickets) * 100) : 0,
        },
        {
          name: t("priority.medium"),
          value: mediumTickets,
          color: "bg-yellow-500",
          percentage: totalTickets > 0 ? Math.round((mediumTickets / totalTickets) * 100) : 0,
        },
        {
          name: t("priority.low"),
          value: lowTickets,
          color: "bg-green-500",
          percentage: totalTickets > 0 ? Math.round((lowTickets / totalTickets) * 100) : 0,
        },
      ],
      topCategories,
      supportTeamStats,
      recentActivity,
      dailyStats,
      pendingUsers: pendingUsersCount,
      knowledgeBase: {
        totalArticles: articles.length,
        publishedArticles: publishedArticles.length,
        totalViews,
        totalHelpful,
        totalNotHelpful,
      },
    })
  }

  const exportToExcel = () => {
    if (!analytics) return

    setIsExporting(true)

    try {
      // Создаем данные для Excel
      const rows = [
        ["Метрика", "Значение"],
        [t("analytics.totalTickets"), analytics.stats[0].value],
        [t("analytics.activeUsers"), analytics.stats[1].value],
        [t("analytics.avgResolutionTime"), analytics.stats[2].value],
        [t("analytics.teamEfficiency"), analytics.stats[3].value],
        [""],
        [t("analytics.statusDistribution"), ""],
        ...analytics.ticketsByStatus.map((item: any) => [item.name, `${item.value} (${item.percentage}%)`]),
        [""],
        [t("analytics.priorityDistribution"), ""],
        ...analytics.ticketsByPriority.map((item: any) => [item.name, `${item.value} (${item.percentage}%)`]),
        [""],
        [t("analytics.popularCategories"), ""],
        ...analytics.topCategories.map((item: any) => [item.category, `${item.count} (${item.percentage}%)`]),
        [""],
        [t("kb.title"), ""],
        [t("analytics.publish"), analytics.knowledgeBase.publishedArticles],
        [t("analytics.views"), analytics.knowledgeBase.totalViews],
        [t("analytics.helpful"), analytics.knowledgeBase.totalHelpful],
        [t("analytics.notHelpful"), analytics.knowledgeBase.totalNotHelpful],
      ]

      // Преобразуем данные в CSV
      const csvContent = rows.map((row) => row.join(",")).join("\n")

      // Создаем Blob для Excel
      const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" })
      const url = URL.createObjectURL(blob)

      // Создаем ссылку для скачивания
      const a = document.createElement("a")
      a.href = url
      a.download = `helpdesk-analytics-${new Date().toISOString().split("T")[0]}.xls`
      document.body.appendChild(a)
      a.click()

      // Очищаем
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 0)
    } catch (error) {
      console.error("Ошибка при экспорте данных:", error)
      alert(t("messages.exportError"))
    }

    setIsExporting(false)
  }

  if (isLoading || !user || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">{t("common.loading")}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("analytics.title")}</h1>
            <p className="text-gray-600 mt-2">{t("analytics.subtitle")}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">{t("analytics.last7Days")}</SelectItem>
                <SelectItem value="30d">{t("analytics.last30Days")}</SelectItem>
                <SelectItem value="90d">{t("analytics.last90Days")}</SelectItem>
                <SelectItem value="1y">{t("analytics.lastYear")}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportToExcel} disabled={isExporting}>
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? t("analytics.exporting") : t("analytics.exportToExcel")}
            </Button>
          </div>
        </div>

        <div ref={reportRef}>
          {/* Основные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {analytics.stats.map((stat: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                      <div className="flex items-center mt-2">
                        {stat.trend === "up" ? (
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span
                          className={`text-xs font-medium ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Распределение по статусам */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  {t("analytics.statusDistribution")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.ticketsByStatus.map((status: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{status.name}</span>
                        <span className="text-sm text-gray-500">
                          {status.value} ({status.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`${status.color} h-2.5 rounded-full`}
                          style={{ width: `${status.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Распределение по приоритетам */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  {t("analytics.priorityDistribution")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.ticketsByPriority.map((priority: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{priority.name}</span>
                        <span className="text-sm text-gray-500">
                          {priority.value} ({priority.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`${priority.color} h-2.5 rounded-full`}
                          style={{ width: `${priority.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Популярные категории */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle>{t("analytics.popularCategories")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topCategories.map((category: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{category.category}</span>
                        <span className="text-sm text-gray-500">
                          {category.count} ({category.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-purple-500 h-2.5 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Последняя активность */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  {t("analytics.recentActivity")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {analytics.recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{activity.event}</p>
                        <p className="text-sm text-gray-500 truncate">{activity.user}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
