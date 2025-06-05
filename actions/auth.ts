"use server"

import { hash } from "bcrypt"
import { redirect } from "next/navigation"
import { z } from "zod"

import prisma from "@/lib/db"

// Схема валидации для регистрации
const registerSchema = z.object({
  firstName: z.string().min(1, "Имя обязательно"),
  lastName: z.string().min(1, "Фамилия обязательна"),
  middleName: z.string().optional(),
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
  organization: z.string().min(1, "Организация обязательна"),
  department: z.string().min(1, "Отдел обязателен"),
  position: z.string().min(1, "Должность обязательна"),
  location: z.string().optional(),
})

export async function registerUser(formData: FormData) {
  const validatedFields = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    middleName: formData.get("middleName"),
    email: formData.get("email"),
    password: formData.get("password"),
    organization: formData.get("organization"),
    department: formData.get("department"),
    position: formData.get("position"),
    location: formData.get("location"),
  })

  if (!validatedFields.success) {
    return { error: "Некорректные данные", details: validatedFields.error.flatten().fieldErrors }
  }

  const { firstName, lastName, middleName, email, password, organization, department, position, location } =
    validatedFields.data

  // Проверка, существует ли пользователь
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (existingUser) {
    return { error: "Пользователь с таким email уже существует" }
  }

  // Хеширование пароля
  const hashedPassword = await hash(password, 10)

  // Создание пользователя
  try {
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        middleName,
        name: `${lastName} ${firstName} ${middleName || ""}`.trim(),
        email,
        password: hashedPassword,
        organization,
        department,
        position,
        location,
      },
    })

    redirect("/auth/login?registered=true")
  } catch (error) {
    return { error: "Ошибка при создании пользователя" }
  }
}
