// Простое хранилище данных в localStorage для демонстрации
export interface Ticket {
    id: string
    title: string
    description: string
    status: "new" | "in-progress" | "resolved" | "closed"
    priority: "low" | "medium" | "high" | "urgent"
    category: string
    clientId: string
    clientName: string
    clientEmail: string
    clientPhone: string
    assignedTo?: string
    assignedToName?: string
    createdAt: string
    updatedAt: string
    closedAt?: string
    comments: TicketComment[]
}

export interface TicketComment {
    id: string
    ticketId: string
    authorId: string
    authorName: string
    content: string
    isInternal: boolean
    createdAt: string
}

export interface KnowledgeBaseArticle {
    id: string
    title: string
    content: string
    category: string
    tags: string[]
    authorId: string
    authorName: string
    createdAt: string
    updatedAt: string
    views: number
    helpful: number
    notHelpful: number
    isPublished: boolean
    userVotes?: Record<string, "helpful" | "notHelpful">
}

export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    middleName?: string
    phone: string
    role: "client" | "support" | "admin"
    department?: string
    position?: string
    isActive: boolean
    createdAt: string
    lastLogin?: string
    isRegistered?: boolean
}

export interface PendingUser {
    id: string
    email: string
    firstName: string
    lastName: string
    middleName?: string
    phone: string
    birthDate?: string
    department: string
    position: string
    employeeId: string
    manager?: string
    workLocation: string
    startDate?: string
    password: string
    securityQuestion: string
    securityAnswer: string
    additionalInfo?: string
    createdAt: string
    status: "pending" | "approved" | "rejected"
}

export interface Notification {
    id: string
    userId: string
    type: "ticket_created" | "ticket_updated" | "user_registered" | "article_published"
    title: string
    message: string
    isRead: boolean
    createdAt: string
    relatedId?: string
}

// Инициализация данных
const initializeData = () => {
    if (typeof window === "undefined") return

    // Инициализация пользователей - включаем тестовых пользователей
    if (!localStorage.getItem("users")) {
        const initialUsers: User[] = [
            {
                id: "admin-1",
                email: "admin@company.com",
                firstName: "Администратор",
                lastName: "Системы",
                phone: "+7 (999) 123-45-67",
                role: "admin",
                department: "IT отдел",
                position: "Администратор",
                isActive: true,
                createdAt: "2025-01-01",
                lastLogin: "2025-06-15",
                isRegistered: true,
            },
            {
                id: "support-1",
                email: "support@company.com",
                firstName: "Анна",
                lastName: "Поддержкина",
                phone: "+7 (999) 234-56-78",
                role: "support",
                department: "Техническая поддержка",
                position: "Специалист поддержки",
                isActive: true,
                createdAt: "2025-01-01",
                lastLogin: "2025-06-15",
                isRegistered: true,
            },
            {
                id: "client-1",
                email: "client@company.com",
                firstName: "Иван",
                lastName: "Клиентов",
                phone: "+7 (999) 345-67-89",
                role: "client",
                department: "Отдел продаж",
                position: "Менеджер",
                isActive: true,
                createdAt: "2025-01-01",
                lastLogin: "2025-06-15",
                isRegistered: true,
            },
        ]
        localStorage.setItem("users", JSON.stringify(initialUsers))
    } else {
        // Проверяем, есть ли тестовые пользователи, если нет - добавляем их
        const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
        const testUserIds = ["admin-1", "support-1", "client-1"]
        const missingTestUsers = testUserIds.filter((id) => !existingUsers.find((u: User) => u.id === id))

        if (missingTestUsers.length > 0) {
            const testUsersToAdd = [
                {
                    id: "admin-1",
                    email: "admin@company.com",
                    firstName: "Администратор",
                    lastName: "Системы",
                    phone: "+7 (999) 123-45-67",
                    role: "admin",
                    department: "IT отдел",
                    position: "Администратор",
                    isActive: true,
                    createdAt: "2025-01-01",
                    lastLogin: "2025-06-15",
                    isRegistered: true,
                },
                {
                    id: "support-1",
                    email: "support@company.com",
                    firstName: "Анна",
                    lastName: "Поддержкина",
                    phone: "+7 (999) 234-56-78",
                    role: "support",
                    department: "Техническая поддержка",
                    position: "Специалист поддержки",
                    isActive: true,
                    createdAt: "2025-01-01",
                    lastLogin: "2025-06-15",
                    isRegistered: true,
                },
                {
                    id: "client-1",
                    email: "client@company.com",
                    firstName: "Иван",
                    lastName: "Клиентов",
                    phone: "+7 (999) 345-67-89",
                    role: "client",
                    department: "Отдел продаж",
                    position: "Менеджер",
                    isActive: true,
                    createdAt: "2025-01-01",
                    lastLogin: "2025-06-15",
                    isRegistered: true,
                },
            ].filter((user) => missingTestUsers.includes(user.id))

            const updatedUsers = [...existingUsers, ...testUsersToAdd]
            localStorage.setItem("users", JSON.stringify(updatedUsers))
        }
    }

    // Инициализация ожидающих регистрации пользователей
    if (!localStorage.getItem("pendingUsers")) {
        localStorage.setItem("pendingUsers", JSON.stringify([]))
    }

    // Инициализация уведомлений
    if (!localStorage.getItem("notifications")) {
        localStorage.setItem("notifications", JSON.stringify([]))
    }

    // Инициализация запросов
    if (!localStorage.getItem("tickets")) {
        const initialTickets: Ticket[] = [
            {
                id: "TK-001",
                title: "Проблема с доступом к корпоративной почте",
                description: "Не могу войти в почтовый ящик, выдает ошибку авторизации",
                status: "resolved",
                priority: "medium",
                category: "account",
                clientId: "client-1",
                clientName: "Иван Клиентов",
                clientEmail: "client@company.com",
                clientPhone: "+7 (999) 345-67-89",
                assignedTo: "support-1",
                assignedToName: "Анна Поддержкина",
                createdAt: "2025-06-14T10:30:00Z",
                updatedAt: "2025-06-15T14:20:00Z",
                comments: [],
            },
            {
                id: "TK-002",
                title: "Настройка нового ноутбука",
                description: "Требуется помощь в настройке рабочего места",
                status: "in-progress",
                priority: "medium",
                category: "technical",
                clientId: "client-1",
                clientName: "Иван Клиентов",
                clientEmail: "client@company.com",
                clientPhone: "+7 (999) 345-67-89",
                assignedTo: "support-1",
                assignedToName: "Анна Поддержкина",
                createdAt: "2025-06-13T14:15:00Z",
                updatedAt: "2025-06-15T09:45:00Z",
                comments: [],
            },
            {
                id: "TK-003",
                title: "Не работает интернет",
                description: "Отсутствует подключение к сети интернет на рабочем месте",
                status: "new", // Изменить статус на "new"
                priority: "high",
                category: "technical",
                clientId: "client-1",
                clientName: "Иван Клиентов",
                clientEmail: "client@company.com",
                clientPhone: "+7 (999) 345-67-89",
                // Убрать assignedTo и assignedToName или установить в null
                assignedTo: null,
                assignedToName: null,
                createdAt: "2025-06-15T08:05:00Z",
                updatedAt: "2025-06-15T08:05:00Z",
                comments: [],
            },
        ]
        localStorage.setItem("tickets", JSON.stringify(initialTickets))
    }

    // Инициализация статей БЗ
    if (!localStorage.getItem("knowledgeBase")) {
        const initialArticles: KnowledgeBaseArticle[] = [
            {
                id: "1",
                title: "Как быстро сменить пароль",
                content: `# Как быстро сменить пароль

## Введение
Смена пароля - важная процедура для обеспечения безопасности вашей учетной записи.

## Пошаговая инструкция

### Шаг 1: Вход в систему
1. Откройте браузер и перейдите на сайт компании
2. Нажмите кнопку "Войти" в правом верхнем углу
3. Введите ваши текущие учетные данные

### Шаг 2: Переход к настройкам
1. После входа нажмите на ваше имя в правом верхнем углу
2. Выберите "Настройки профиля" из выпадающего меню
3. Перейдите на вкладку "Безопасность"

### Шаг 3: Смена пароля
1. Найдите раздел "Смена пароля"
2. Введите текущий пароль
3. Введите новый пароль (минимум 8 символов)
4. Подтвердите новый пароль
5. Нажмите кнопку "Сохранить изменения"`,
                category: "Безопасность",
                tags: ["пароль", "безопасность", "учетная запись"],
                authorId: "support-1",
                authorName: "Анна Поддержкина",
                createdAt: "2025-06-10",
                updatedAt: "2025-06-15",
                views: 245,
                helpful: 23,
                notHelpful: 2,
                isPublished: true,
                userVotes: {},
            },
            {
                id: "2",
                title: "Настройка принтера",
                content: `# Настройка принтера

## Подключение принтера

### Физическое подключение
1. Убедитесь, что принтер выключен
2. Подключите USB-кабель к принтеру и компьютеру
3. Подключите кабель питания к принтеру
4. Включите принтер

### Установка драйверов
1. Откройте "Панель управления"
2. Выберите "Устройства и принтеры"
3. Нажмите "Добавить принтер"
4. Следуйте инструкциям мастера установки`,
                category: "Оборудование",
                tags: ["принтер", "оборудование", "настройка"],
                authorId: "support-1",
                authorName: "Анна Поддержкина",
                createdAt: "2025-06-08",
                updatedAt: "2025-06-12",
                views: 189,
                helpful: 18,
                notHelpful: 1,
                isPublished: true,
                userVotes: {},
            },
        ]
        localStorage.setItem("knowledgeBase", JSON.stringify(initialArticles))
    }
}

// Функции для работы с данными
export const dataStore = {
    // Инициализация
    init: initializeData,

    // Пользователи
    getUsers: (): User[] => {
        if (typeof window === "undefined") return []
        const users = localStorage.getItem("users")
        return users ? JSON.parse(users) : []
    },

    saveUsers: (users: User[]) => {
        if (typeof window === "undefined") return
        localStorage.setItem("users", JSON.stringify(users))
    },

    addUser: (user: Omit<User, "id" | "createdAt">) => {
        const users = dataStore.getUsers()
        const newUser: User = {
            ...user,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            isRegistered: true,
        }
        users.push(newUser)
        dataStore.saveUsers(users)
        return newUser
    },

    updateUser: (id: string, updates: Partial<User>) => {
        const users = dataStore.getUsers()
        const index = users.findIndex((u) => u.id === id)
        if (index !== -1) {
            users[index] = { ...users[index], ...updates }
            dataStore.saveUsers(users)

            // Обновляем данные в контексте аутентификации если это текущий пользователь
            const currentUserData = localStorage.getItem("currentUser")
            if (currentUserData) {
                const currentUser = JSON.parse(currentUserData)
                if (currentUser.id === id) {
                    localStorage.setItem("currentUser", JSON.stringify(users[index]))
                }
            }

            return users[index]
        }
        return null
    },

    deleteUser: (id: string) => {
        const users = dataStore.getUsers()
        const filtered = users.filter((u) => u.id !== id)
        dataStore.saveUsers(filtered)
    },

    // Ожидающие регистрации пользователи
    getPendingUsers: (): PendingUser[] => {
        if (typeof window === "undefined") return []
        const pendingUsers = localStorage.getItem("pendingUsers")
        return pendingUsers ? JSON.parse(pendingUsers) : []
    },

    savePendingUsers: (pendingUsers: PendingUser[]) => {
        if (typeof window === "undefined") return
        localStorage.setItem("pendingUsers", JSON.stringify(pendingUsers))
    },

    addPendingUser: (userData: Omit<PendingUser, "id" | "createdAt" | "status">) => {
        const pendingUsers = dataStore.getPendingUsers()
        const newPendingUser: PendingUser = {
            ...userData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            status: "pending",
        }
        pendingUsers.push(newPendingUser)
        dataStore.savePendingUsers(pendingUsers)
        return newPendingUser
    },

    approvePendingUser: (id: string) => {
        const pendingUsers = dataStore.getPendingUsers()
        const pendingUser = pendingUsers.find((u) => u.id === id)
        if (pendingUser) {
            // Создаем нового пользователя
            const newUser = dataStore.addUser({
                email: pendingUser.email,
                firstName: pendingUser.firstName,
                lastName: pendingUser.lastName,
                middleName: pendingUser.middleName,
                phone: pendingUser.phone,
                role: "client",
                department: pendingUser.department,
                position: pendingUser.position,
                isActive: true,
            })

            // Удаляем из ожидающих
            const filtered = pendingUsers.filter((u) => u.id !== id)
            dataStore.savePendingUsers(filtered)

            return newUser
        }
        return null
    },

    rejectPendingUser: (id: string) => {
        const pendingUsers = dataStore.getPendingUsers()
        const filtered = pendingUsers.filter((u) => u.id !== id)
        dataStore.savePendingUsers(filtered)
    },

    // Запросы
    getTickets: (): Ticket[] => {
        if (typeof window === "undefined") return []
        const tickets = localStorage.getItem("tickets")
        return tickets ? JSON.parse(tickets) : []
    },

    saveTickets: (tickets: Ticket[]) => {
        if (typeof window === "undefined") return
        localStorage.setItem("tickets", JSON.stringify(tickets))
    },

    addTicket: (ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "comments">) => {
        const tickets = dataStore.getTickets()
        const newTicket: Ticket = {
            ...ticket,
            id: `TK-${String(Date.now()).slice(-6)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: [],
        }
        tickets.push(newTicket)
        dataStore.saveTickets(tickets)
        return newTicket
    },

    updateTicket: (id: string, updates: Partial<Ticket>) => {
        const tickets = dataStore.getTickets()
        const index = tickets.findIndex((t) => t.id === id)
        if (index !== -1) {
            tickets[index] = {
                ...tickets[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            }
            if (updates.status === "closed") {
                tickets[index].closedAt = new Date().toISOString()
            }
            dataStore.saveTickets(tickets)
            return tickets[index]
        }
        return null
    },

    deleteTicket: (id: string) => {
        const tickets = dataStore.getTickets()
        const filtered = tickets.filter((t) => t.id !== id)
        dataStore.saveTickets(filtered)
    },

    addComment: (ticketId: string, comment: Omit<TicketComment, "id" | "createdAt">) => {
        const tickets = dataStore.getTickets()
        const ticket = tickets.find((t) => t.id === ticketId)
        if (ticket) {
            const newComment: TicketComment = {
                ...comment,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
            }
            ticket.comments.push(newComment)
            ticket.updatedAt = new Date().toISOString()
            dataStore.saveTickets(tickets)
            return newComment
        }
        return null
    },

    // База знаний
    getArticles: (): KnowledgeBaseArticle[] => {
        if (typeof window === "undefined") return []
        const articles = localStorage.getItem("knowledgeBase")
        return articles ? JSON.parse(articles) : []
    },

    saveArticles: (articles: KnowledgeBaseArticle[]) => {
        if (typeof window === "undefined") return
        localStorage.setItem("knowledgeBase", JSON.stringify(articles))
    },

    addArticle: (
        article: Omit<
            KnowledgeBaseArticle,
            "id" | "createdAt" | "updatedAt" | "views" | "helpful" | "notHelpful" | "userVotes"
        >,
    ) => {
        const articles = dataStore.getArticles()
        const newArticle: KnowledgeBaseArticle = {
            ...article,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: 0,
            helpful: 0,
            notHelpful: 0,
            userVotes: {},
        }
        articles.push(newArticle)
        dataStore.saveArticles(articles)
        return newArticle
    },

    updateArticle: (id: string, updates: Partial<KnowledgeBaseArticle>) => {
        const articles = dataStore.getArticles()
        const index = articles.findIndex((a) => a.id === id)
        if (index !== -1) {
            articles[index] = {
                ...articles[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            }
            dataStore.saveArticles(articles)
            return articles[index]
        }
        return null
    },

    deleteArticle: (id: string) => {
        const articles = dataStore.getArticles()
        const filtered = articles.filter((a) => a.id !== id)
        dataStore.saveArticles(filtered)
    },

    voteArticle: (id: string, userId: string, isHelpful: boolean) => {
        const articles = dataStore.getArticles()
        const article = articles.find((a) => a.id === id)
        if (article) {
            // Инициализируем userVotes если его нет
            if (!article.userVotes) {
                article.userVotes = {}
            }

            // Проверяем, голосовал ли уже пользователь
            const previousVote = article.userVotes[userId]

            if (previousVote !== undefined) {
                // Если пользователь уже голосовал, не разрешаем повторное голосование
                return null
            }

            // Записываем голос пользователя
            article.userVotes[userId] = isHelpful ? "helpful" : "notHelpful"

            // Обновляем счетчики
            if (isHelpful) {
                article.helpful += 1
            } else {
                article.notHelpful += 1
            }

            dataStore.saveArticles(articles)
            return article
        }
        return null
    },

    incrementViews: (id: string) => {
        const articles = dataStore.getArticles()
        const article = articles.find((a) => a.id === id)
        if (article) {
            article.views += 1
            dataStore.saveArticles(articles)
            return article
        }
        return null
    },

    // Уведомления
    getNotifications: (): Notification[] => {
        if (typeof window === "undefined") return []
        const notifications = localStorage.getItem("notifications")
        return notifications ? JSON.parse(notifications) : []
    },

    getNotificationsByUser: (userId: string): Notification[] => {
        const notifications = dataStore.getNotifications()
        return notifications.filter((n) => n.userId === userId || n.userId === "all")
    },

    saveNotifications: (notifications: Notification[]) => {
        if (typeof window === "undefined") return
        localStorage.setItem("notifications", JSON.stringify(notifications))
    },

    addNotification: (notification: Omit<Notification, "id" | "createdAt" | "isRead">) => {
        const notifications = dataStore.getNotifications()
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            isRead: false,
        }
        notifications.push(newNotification)
        dataStore.saveNotifications(notifications)
        return newNotification
    },

    markNotificationAsRead: (id: string) => {
        const notifications = dataStore.getNotifications()
        const notification = notifications.find((n) => n.id === id)
        if (notification) {
            notification.isRead = true
            dataStore.saveNotifications(notifications)
        }
    },

    markAllNotificationsAsRead: (userId: string) => {
        const notifications = dataStore.getNotifications()
        notifications
            .filter((n) => (n.userId === userId || n.userId === "all") && !n.isRead)
            .forEach((n) => {
                n.isRead = true
            })
        dataStore.saveNotifications(notifications)
    },

    // Аналитика
    getAnalytics: () => {
        const tickets = dataStore.getTickets()
        const users = dataStore.getUsers()
        const articles = dataStore.getArticles()

        // Статистика по статусам
        const statusStats = {
            new: tickets.filter((t) => t.status === "new").length,
            "in-progress": tickets.filter((t) => t.status === "in-progress").length,
            resolved: tickets.filter((t) => t.status === "resolved").length,
            closed: tickets.filter((t) => t.status === "closed").length,
        }

        // Статистика по приоритетам
        const priorityStats = {
            low: tickets.filter((t) => t.priority === "low").length,
            medium: tickets.filter((t) => t.priority === "medium").length,
            high: tickets.filter((t) => t.priority === "high").length,
            urgent: tickets.filter((t) => t.priority === "urgent").length,
        }

        // Статистика по категориям
        const categoryStats: { [key: string]: number } = {}
        tickets.forEach((ticket) => {
            categoryStats[ticket.category] = (categoryStats[ticket.category] || 0) + 1
        })

        // Статистика команды
        const supportUsers = users.filter((u) => u.role === "support")
        const teamStats = supportUsers.map((user) => {
            const assignedTickets = tickets.filter((t) => t.assignedTo === user.id)
            const resolvedTickets = assignedTickets.filter((t) => t.status === "resolved" || t.status === "closed")
            return {
                name: `${user.firstName} ${user.lastName}`,
                assigned: assignedTickets.length,
                resolved: resolvedTickets.length,
                efficiency:
                    assignedTickets.length > 0 ? Math.round((resolvedTickets.length / assignedTickets.length) * 100) : 0,
            }
        })

        return {
            totalTickets: tickets.length,
            totalUsers: users.length,
            totalArticles: articles.length,
            statusStats,
            priorityStats,
            categoryStats,
            teamStats,
        }
    },
}
