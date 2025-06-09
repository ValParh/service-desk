import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(request)

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const userId = params.id
    const userData = await request.json()

    const { firstName, lastName, middleName, email, phone, role, department, position, isActive, password } = userData

    // Проверка существования пользователя
    const existingUsers = await query("SELECT id FROM users WHERE id = ?", [userId])

    if (existingUsers.length === 0) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    // Проверка уникальности email (исключая текущего пользователя)
    const emailCheck = await query("SELECT id FROM users WHERE email = ? AND id != ?", [email, userId])

    if (emailCheck.length > 0) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 400 })
    }

    let updateQuery = `
      UPDATE users SET 
        first_name = ?, last_name = ?, middle_name = ?, email = ?, 
        phone = ?, role = ?, department = ?, position = ?, is_active = ?
    `
    const queryParams = [firstName, lastName, middleName, email, phone, role, department, position, isActive]

    // Если передан новый пароль, обновляем его
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10)
      updateQuery += ", password_hash = ?"
      queryParams.push(passwordHash)
    }

    updateQuery += " WHERE id = ?"
    queryParams.push(userId)

    await query(updateQuery, queryParams)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(request)

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const userId = params.id

    // Нельзя удалить самого себя
    if (currentUser.id === Number.parseInt(userId)) {
      return NextResponse.json({ error: "Нельзя удалить свою учетную запись" }, { status: 400 })
    }

    // Проверка существования пользователя
    const existingUsers = await query("SELECT id FROM users WHERE id = ?", [userId])

    if (existingUsers.length === 0) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    // Удаление пользователя (каскадное удаление сессий)
    await query("DELETE FROM users WHERE id = ?", [userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
