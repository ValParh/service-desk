"use client"

import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, LogOut, User, Ticket, BookOpen, Users, BarChart3, Globe } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { dataStore, type Notification } from "@/lib/data-store"

export function Navigation() {
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("click", handleClickOutside)

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [showNotifications])

  useEffect(() => {
    if (user) {
      dataStore.init()
      // Получаем только непрочитанные уведомления для пользователя
      const userNotifications = dataStore
        .getNotificationsByUser(user.id)
        .filter((n) => !n.isRead)
        .slice(0, 10) // Показываем последние 10 непрочитанных

      setNotifications(userNotifications)
      setUnreadCount(userNotifications.length)
    }
  }, [user])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      dataStore.markNotificationAsRead(notification.id)
      setUnreadCount((prev) => Math.max(0, prev - 1))
      // Удаляем прочитанное уведомление из списка
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
    }

    if (notification.relatedId) {
      switch (notification.type) {
        case "ticket_created":
        case "ticket_updated":
          router.push(`/tickets/${notification.relatedId}`)
          break
        case "article_published":
          router.push(`/knowledge-base/${notification.relatedId}`)
          break
        case "user_registered":
          router.push("/users")
          break
      }
    }
  }

  const markAllAsRead = () => {
    if (user) {
      dataStore.markAllNotificationsAsRead(user.id)
      setUnreadCount(0)
      // Очищаем список уведомлений, так как все прочитаны
      setNotifications([])
    }
  }

  if (!user) return null

  const navItems = [
    {
      href: "/",
      label: t("nav.home"),
      icon: User,
      roles: ["admin", "support", "client"],
    },
    {
      href: user.role === "client" ? "/my-tickets" : "/tickets",
      label: user.role === "client" ? t("nav.myTickets") : t("nav.tickets"),
      icon: Ticket,
      roles: ["admin", "support", "client"],
    },
    {
      href: "/knowledge-base",
      label: t("nav.knowledgeBase"),
      icon: BookOpen,
      roles: ["admin", "support", "client"],
    },
    {
      href: "/users",
      label: t("nav.users"),
      icon: Users,
      roles: ["admin"],
    },
    {
      href: "/analytics",
      label: t("nav.analytics"),
      icon: BarChart3,
      roles: ["admin"],
    },
  ]

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role))

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="T Plus" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900">Help Desk</span>
            </Link>
            <div className="hidden md:flex space-x-6">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Уведомления */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("notifications.title")}</h3>
                      {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                          {t("notifications.markAllAsRead")}
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">{t("notifications.noNotifications")}</p>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              notification.isRead ? "bg-gray-50" : "bg-blue-50 border border-blue-200"
                            }`}
                            onClick={() => {
                              handleNotificationClick(notification)
                              setShowNotifications(false)
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{notification.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(notification.createdAt).toLocaleString(
                                    language === "ru" ? "ru-RU" : "en-US",
                                  )}
                                </p>
                              </div>
                              {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-gray-500">{t(`role.${user.role}`)}</div>
              </div>

              {/* Переключатель языка - перемещен в конец */}
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <Select value={language} onValueChange={(value: "ru" | "en") => setLanguage(value)}>
                  <SelectTrigger className="w-16 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">RU</SelectItem>
                    <SelectItem value="en">EN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
