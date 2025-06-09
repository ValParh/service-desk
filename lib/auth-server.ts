import type { NextRequest } from "next/server"
import { dataStore } from "./data-store"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  middleName?: string | null
  phone?: string | null
  role: "client" | "support" | "admin"
  department?: string | null
  position?: string | null
  isActive: boolean
}

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    // Получаем токен из cookie
    const sessionId = request.cookies.get("session")?.value

    if (!sessionId) {
      return null
    }

    // Проверяем сессию в dataStore
    dataStore.init()
    const users = dataStore.getUsers()
    const user = users.find((u) => u.id === sessionId && u.isActive)

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      phone: user.phone,
      role: user.role,
      department: user.department,
      position: user.position,
      isActive: user.isActive,
    }
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}
