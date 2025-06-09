// Скрипт для сброса данных и принудительного создания тестовых пользователей
console.log("Сброс данных localStorage...")

// Очищаем все данные
localStorage.removeItem("users")
localStorage.removeItem("tickets")
localStorage.removeItem("knowledgeBase")
localStorage.removeItem("pendingUsers")
localStorage.removeItem("notifications")
localStorage.removeItem("currentUser")

console.log("Данные очищены. Перезагрузите страницу для создания тестовых пользователей.")

// Принудительно создаем тестовых пользователей
const testUsers = [
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

localStorage.setItem("users", JSON.stringify(testUsers))
console.log("Тестовые пользователи созданы:", testUsers)
console.log("Теперь можете войти как:")
console.log("- admin@company.com / admin123")
console.log("- support@company.com / support123")
console.log("- client@company.com / client123")
