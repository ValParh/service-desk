// Моковая система аутентификации для демо

import { type User, mockUsers } from "./mock-data"

let currentUser: User | null = mockUsers[0] // По умолчанию админ для демо

export const mockAuth = {
  getCurrentUser: (): User | null => {
    return currentUser
  },

  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    // Имитация задержки сети
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = mockUsers.find((u) => u.email === email)

    if (!user) {
      return { success: false, error: "Пользователь не найден" }
    }

    // В демо любой пароль подходит
    currentUser = user
    return { success: true, user }
  },

  register: async (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    department: string
    position: string
  }): Promise<{ success: boolean; error?: string }> => {
    // Имитация задержки сети
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Проверяем, существует ли пользователь
    const existingUser = mockUsers.find((u) => u.email === userData.email)
    if (existingUser) {
      return { success: false, error: "Пользователь с таким email уже существует" }
    }

    // В демо просто возвращаем успех
    return { success: true }
  },

  logout: () => {
    currentUser = null
  },

  isAuthenticated: (): boolean => {
    return currentUser !== null
  },

  hasRole: (role: string): boolean => {
    return currentUser?.role === role
  },

  isAdmin: (): boolean => {
    return currentUser?.role === "ADMIN"
  },

  isTechnician: (): boolean => {
    return currentUser?.role === "TECHNICIAN" || currentUser?.role === "ADMIN"
  },
}
