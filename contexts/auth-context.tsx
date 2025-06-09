"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { dataStore, type User } from "@/lib/data-store"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Тестовые пользователи с паролями
const testUsers = [
  { email: "admin@company.com", password: "admin123", id: "admin-1" },
  { email: "support@company.com", password: "support123", id: "support-1" },
  { email: "client@company.com", password: "client123", id: "client-1" },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Инициализируем dataStore при загрузке
    dataStore.init()

    // Проверяем сохраненную сессию
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("currentUser")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Проверяем тестовых пользователей
      const testUser = testUsers.find((u) => u.email === email && u.password === password)
      if (testUser) {
        const users = dataStore.getUsers()
        const userData = users.find((u) => u.id === testUser.id)
        if (userData) {
          // Обновляем lastLogin
          const updatedUser = dataStore.updateUser(userData.id, {
            lastLogin: new Date().toISOString(),
          })
          if (updatedUser) {
            setUser(updatedUser)
            localStorage.setItem("currentUser", JSON.stringify(updatedUser))
            return true
          }
        }
      }

      // Проверяем пользователей из dataStore (новые пользователи)
      const users = dataStore.getUsers()
      const userData = users.find((u) => u.email === email)
      if (userData && userData.isRegistered) {
        // Для новых пользователей пароль по умолчанию "password123"
        if (password === "password123") {
          // Обновляем lastLogin
          const updatedUser = dataStore.updateUser(userData.id, {
            lastLogin: new Date().toISOString(),
          })
          if (updatedUser) {
            setUser(updatedUser)
            localStorage.setItem("currentUser", JSON.stringify(updatedUser))
            return true
          }
        }
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
