import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "30d"

    // Определение периода для фильтрации
    const dateFilter = new Date()
    switch (timeRange) {
      case "7d":
        dateFilter.setDate(dateFilter.getDate() - 7)
        break
      case "30d":
        dateFilter.setDate(dateFilter.getDate() - 30)
        break
      case "90d":
        dateFilter.setDate(dateFilter.getDate() - 90)
        break
      case "1y":
        dateFilter.setFullYear(dateFilter.getFullYear() - 1)
        break
      default:
        dateFilter.setDate(dateFilter.getDate() - 30)
    }

    // Общая статистика запросов
    const [totalTickets, newTickets, inProgressTickets, resolvedTickets, closedTickets] = await Promise.all([
      prisma.ticket.count({ where: { createdAt: { gte: dateFilter } } }),
      prisma.ticket.count({ where: { status: "NEW", createdAt: { gte: dateFilter } } }),
      prisma.ticket.count({ where: { status: "IN_PROGRESS", createdAt: { gte: dateFilter } } }),
      prisma.ticket.count({ where: { status: "RESOLVED", createdAt: { gte: dateFilter } } }),
      prisma.ticket.count({ where: { status: "CLOSED", createdAt: { gte: dateFilter } } }),
    ])

    // Статистика по приоритетам
    const [urgentTickets, highTickets, mediumTickets, lowTickets] = await Promise.all([
      prisma.ticket.count({ where: { priority: "URGENT", createdAt: { gte: dateFilter } } }),
      prisma.ticket.count({ where: { priority: "HIGH", createdAt: { gte: dateFilter } } }),
      prisma.ticket.count({ where: { priority: "MEDIUM", createdAt: { gte: dateFilter } } }),
      prisma.ticket.count({ where: { priority: "LOW", createdAt: { gte: dateFilter } } }),
    ])

    // Статистика пользователей
    const [totalUsers, activeUsers, clients, supportStaff, admins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.user.count({ where: { role: "SUPPORT" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
    ])

    // Топ категории
    const topCategories = await prisma.ticket.groupBy({
      by: ["categoryId"],
      where: { createdAt: { gte: dateFilter } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    })

    // Получение названий категорий
    const categoryIds = topCategories.map((cat) => cat.categoryId).filter(Boolean)
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    })

    const topCategoriesWithNames = topCategories.map((cat) => {
      const category = categories.find((c) => c.id === cat.categoryId)
      return {
        categoryName: category?.name || "Без категории",
        ticketCount: cat._count.id,
        percentage: Math.round((cat._count.id / totalTickets) * 100 * 10) / 10,
      }
    })

    // Статистика команды поддержки
    const supportTeamStats = await prisma.user.findMany({
      where: {
        role: { in: ["SUPPORT", "ADMIN"] },
        isActive: true,
      },
      select: {
        firstName: true,
        lastName: true,
        assignedTickets: {
          where: {
            status: { in: ["RESOLVED", "CLOSED"] },
            createdAt: { gte: dateFilter },
          },
        },
      },
    })

    // Статистика базы знаний
    const kbStats = await prisma.knowledgeBaseArticle.aggregate({
      _count: { id: true },
      _sum: {
        views: true,
        helpfulVotes: true,
        notHelpfulVotes: true,
      },
      where: { isPublished: true },
    })

    const analytics = {
      tickets: {
        total: totalTickets,
        new: newTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
        byPriority: {
          urgent: urgentTickets,
          high: highTickets,
          medium: mediumTickets,
          low: lowTickets,
        },
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        clients,
        support: supportStaff,
        admins,
      },
      topCategories: topCategoriesWithNames,
      supportTeam: supportTeamStats.map((user) => ({
        firstName: user.firstName,
        lastName: user.lastName,
        resolvedTickets: user.assignedTickets.length,
        avgResolutionHours: 0, // Можно добавить расчет среднего времени
      })),
      knowledgeBase: {
        totalArticles: kbStats._count.id,
        publishedArticles: kbStats._count.id,
        totalViews: kbStats._sum.views || 0,
        totalHelpfulVotes: kbStats._sum.helpfulVotes || 0,
        totalNotHelpfulVotes: kbStats._sum.notHelpfulVotes || 0,
      },
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
