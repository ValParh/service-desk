export type UserRole = "client" | "support" | "admin"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  middleName?: string
  phone: string
  role: UserRole
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

// Мок данные для демонстрации
export const mockUsers: User[] = [
  {
    id: "1",
    email: "client@tplus.ru",
    firstName: "Иван",
    lastName: "Петров",
    middleName: "Сергеевич",
    phone: "+7 (495) 123-45-67",
    role: "client",
    isActive: true,
    createdAt: "2025-01-01",
    lastLogin: "2025-06-15",
  },
  {
    id: "2",
    email: "support@tplus.ru",
    firstName: "Мария",
    lastName: "Иванова",
    phone: "+7 (495) 234-56-78",
    role: "support",
    isActive: true,
    createdAt: "2025-01-01",
    lastLogin: "2025-06-15",
  },
  {
    id: "3",
    email: "admin@tplus.ru",
    firstName: "Александр",
    lastName: "Сидоров",
    phone: "+7 (495) 345-67-89",
    role: "admin",
    isActive: true,
    createdAt: "2025-01-01",
    lastLogin: "2025-06-15",
  },
]

export const authenticate = (email: string, password: string): User | null => {
  // Простая проверка для демонстрации
  const user = mockUsers.find((u) => u.email === email && u.isActive)
  return user || null
}
