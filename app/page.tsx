"use client"

import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket, Clock, CheckCircle, TrendingUp, Users, BookOpen, AlertTriangle, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { dataStore } from "@/lib/data-store"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [stats, setStats] = useState<any[]>([])

  useEffect(() => {
    dataStore.init()
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      const tickets = dataStore.getTickets()
      const users = dataStore.getUsers()
      const articles = dataStore.getArticles()

      if (user.role === "client") {
        const myTickets = tickets.filter((t) => t.clientId === user.id)
        setStats([
          { title: t("home.myRequests"), value: myTickets.length.toString(), icon: Ticket, color: "text-blue-600" },
          {
            title: t("home.inProgress"),
            value: myTickets.filter((t) => t.status === "in-progress").length.toString(),
            icon: Clock,
            color: "text-yellow-600",
          },
          {
            title: t("home.resolved"),
            value: myTickets.filter((t) => t.status === "resolved" || t.status === "closed").length.toString(),
            icon: CheckCircle,
            color: "text-green-600",
          },
          { title: t("home.averageTime"), value: "2ч", icon: TrendingUp, color: "text-purple-600" },
        ])
      } else if (user.role === "support") {
        const myTickets = tickets.filter((t) => t.assignedTo === user.id)
        const newTickets = tickets.filter((t) => t.status === "new")
        setStats([
          { title: t("home.myTickets"), value: myTickets.length.toString(), icon: Ticket, color: "text-blue-600" },
          {
            title: t("home.newTickets"),
            value: newTickets.length.toString(),
            icon: AlertTriangle,
            color: "text-red-600",
          },
          {
            title: t("home.inProgress"),
            value: myTickets.filter((t) => t.status === "in-progress").length.toString(),
            icon: Clock,
            color: "text-yellow-600",
          },
          {
            title: t("home.resolvedToday"),
            value: myTickets
              .filter(
                (t) => t.status === "resolved" && new Date(t.updatedAt).toDateString() === new Date().toDateString(),
              )
              .length.toString(),
            icon: CheckCircle,
            color: "text-green-600",
          },
        ])
      } else if (user.role === "admin") {
        setStats([
          { title: t("home.totalTickets"), value: tickets.length.toString(), icon: Ticket, color: "text-blue-600" },
          { title: t("home.totalUsers"), value: users.length.toString(), icon: Users, color: "text-green-600" },
          { title: t("home.kbArticles"), value: articles.length.toString(), icon: BookOpen, color: "text-purple-600" },
          {
            title: t("home.activeTickets"),
            value: tickets.filter((t) => t.status === "new" || t.status === "in-progress").length.toString(),
            icon: BarChart3,
            color: "text-orange-600",
          },
        ])
      }
    }
  }, [user, t])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">{t("common.loading")}</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t("home.greeting.morning")
    if (hour < 18) return t("home.greeting.afternoon")
    return t("home.greeting.evening")
  }

  const getQuickActions = () => {
    if (user.role === "client") {
      return [
        { title: t("home.createTicket"), href: "/tickets/new", description: t("home.createTicketDesc") },
        { title: t("nav.myTickets"), href: "/my-tickets", description: t("home.myTicketsDesc") },
        { title: t("nav.knowledgeBase"), href: "/knowledge-base", description: t("home.knowledgeBaseDesc") },
      ]
    } else if (user.role === "support") {
      return [
        { title: t("home.manageTickets"), href: "/tickets", description: t("home.manageTicketsDesc") },
        { title: t("home.manageKB"), href: "/knowledge-base", description: t("home.manageKBDesc") },
        { title: t("home.createArticle"), href: "/knowledge-base/manage", description: t("home.createArticleDesc") },
      ]
    } else {
      return [
        { title: t("home.manageTickets"), href: "/tickets", description: t("home.manageTicketsDesc") },
        { title: t("home.manageUsers"), href: "/users", description: t("home.manageUsersDesc") },
        { title: t("nav.analytics"), href: "/analytics", description: t("home.analyticsDesc") },
        { title: t("nav.knowledgeBase"), href: "/knowledge-base", description: t("home.manageKBDesc") },
      ]
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {user.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">{t("home.welcome")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("home.quickActions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getQuickActions().map((action, index) => (
                  <Link key={index} href={action.href}>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("home.recentUpdates")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t("home.systemUpdated")}</p>
                    <p className="text-xs text-gray-600">{t("home.systemUpdatedDesc")}</p>
                    <p className="text-xs text-gray-500 mt-1">{t("time.hoursAgo").replace("часа", "2")}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t("home.kbUpdated")}</p>
                    <p className="text-xs text-gray-600">{t("home.kbUpdatedDesc")}</p>
                    <p className="text-xs text-gray-500 mt-1">1 {t("time.daysAgo")}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t("home.maintenance")}</p>
                    <p className="text-xs text-gray-600">{t("home.maintenanceDesc")}</p>
                    <p className="text-xs text-gray-500 mt-1">3 {t("time.daysAgo")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
