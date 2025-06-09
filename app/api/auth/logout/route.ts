import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session")?.value

    if (sessionId) {
      // Удаление сессии из базы данных
      await prisma.userSession
        .delete({
          where: { id: sessionId },
        })
        .catch(() => {
          // Игнорируем ошибку если сессия уже удалена
        })
    }

    const response = NextResponse.json({ success: true })

    // Удаление cookie
    response.cookies.delete("session")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
