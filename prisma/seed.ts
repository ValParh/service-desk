import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Начинаем заполнение базы данных...")

  // Создание категорий
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Техническая поддержка",
        description: "Общие технические вопросы",
        color: "#3B82F6",
      },
    }),
    prisma.category.create({
      data: {
        name: "Оборудование",
        description: "Проблемы с оборудованием",
        color: "#EF4444",
      },
    }),
    prisma.category.create({
      data: {
        name: "Программное обеспечение",
        description: "Вопросы по ПО",
        color: "#10B981",
      },
    }),
    prisma.category.create({
      data: {
        name: "Сеть",
        description: "Сетевые проблемы",
        color: "#F59E0B",
      },
    }),
    prisma.category.create({
      data: {
        name: "Безопасность",
        description: "Вопросы безопасности",
        color: "#8B5CF6",
      },
    }),
    prisma.category.create({
      data: {
        name: "Учетные записи",
        description: "Проблемы с доступом",
        color: "#EC4899",
      },
    }),
  ])

  console.log("✅ Категории созданы")

  // Хеширование пароля для всех пользователей
  const passwordHash = await bcrypt.hash("password123", 10)

  // Создание пользователей
  const admin = await prisma.user.create({
    data: {
      email: "admin@tplus.ru",
      passwordHash,
      firstName: "Александр",
      lastName: "Сидоров",
      middleName: "Владимирович",
      phone: "+7 (495) 345-67-89",
      role: "ADMIN",
      department: "IT отдел",
      position: "Системный администратор",
      employeeId: "EMP001",
    },
  })

  const support1 = await prisma.user.create({
    data: {
      email: "support@tplus.ru",
      passwordHash,
      firstName: "Мария",
      lastName: "Иванова",
      middleName: "Александровна",
      phone: "+7 (495) 234-56-78",
      role: "SUPPORT",
      department: "Техническая поддержка",
      position: "Специалист поддержки",
      employeeId: "EMP002",
    },
  })

  const client = await prisma.user.create({
    data: {
      email: "client@tplus.ru",
      passwordHash,
      firstName: "Иван",
      lastName: "Петров",
      middleName: "Сергеевич",
      phone: "+7 (495) 123-45-67",
      role: "CLIENT",
      department: "Отдел продаж",
      position: "Менеджер по продажам",
      employeeId: "EMP003",
    },
  })

  const support2 = await prisma.user.create({
    data: {
      email: "kozlova@tplus.ru",
      passwordHash,
      firstName: "Елена",
      lastName: "Козлова",
      middleName: "Петровна",
      phone: "+7 (495) 456-78-90",
      role: "SUPPORT",
      department: "Техническая поддержка",
      position: "Старший специалист",
      employeeId: "EMP004",
    },
  })

  console.log("✅ Пользователи созданы")

  // Создание статей базы знаний
  await Promise.all([
    prisma.knowledgeBaseArticle.create({
      data: {
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
        authorId: support1.id,
        isPublished: true,
        views: 245,
        helpfulVotes: 23,
        notHelpfulVotes: 2,
      },
    }),
    prisma.knowledgeBaseArticle.create({
      data: {
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
        authorId: support2.id,
        isPublished: true,
        views: 189,
        helpfulVotes: 18,
        notHelpfulVotes: 1,
      },
    }),
  ])

  console.log("✅ Статьи базы знаний созданы")

  // Создание тестовых запросов
  const ticket1 = await prisma.ticket.create({
    data: {
      ticketNumber: "TK-2025-0001",
      title: "Не работает принтер HP LaserJet",
      description: "Принтер не печатает документы, горит красная лампочка",
      status: "IN_PROGRESS",
      priority: "HIGH",
      categoryId: categories[1].id, // Оборудование
      clientId: client.id,
      assignedTo: support2.id,
    },
  })

  await prisma.ticket.create({
    data: {
      ticketNumber: "TK-2025-0002",
      title: "Проблема с доступом к почте",
      description: "Не могу войти в корпоративную почту",
      status: "RESOLVED",
      priority: "MEDIUM",
      categoryId: categories[5].id, // Учетные записи
      clientId: client.id,
      assignedTo: support1.id,
    },
  })

  await prisma.ticket.create({
    data: {
      ticketNumber: "TK-2025-0003",
      title: "Медленная работа компьютера",
      description: "Компьютер стал очень медленно работать",
      status: "NEW",
      priority: "LOW",
      categoryId: categories[0].id, // Техническая поддержка
      clientId: client.id,
    },
  })

  console.log("✅ Тестовые запросы созданы")

  // Создание комментариев к запросам
  await Promise.all([
    prisma.ticketComment.create({
      data: {
        ticketId: ticket1.id,
        authorId: client.id,
        content: "Принтер находится в офисе 205, второй этаж",
        isInternal: false,
      },
    }),
    prisma.ticketComment.create({
      data: {
        ticketId: ticket1.id,
        authorId: support2.id,
        content: "Принял в работу. Подойду для диагностики в течение часа",
        isInternal: false,
      },
    }),
  ])

  console.log("✅ Комментарии к запросам созданы")

  console.log("🎉 База данных успешно заполнена!")
}

main()
  .catch((e) => {
    console.error("❌ Ошибка при заполнении базы данных:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
