import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Начинаем заполнение базы данных...")

  // Создание пользователей
  const hashedPassword = await hash("password123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      name: "Иван Петров",
      firstName: "Иван",
      lastName: "Петров",
      email: "admin@company.com",
      password: hashedPassword,
      role: "ADMIN",
      department: "IT отдел",
      position: "Системный администратор",
      location: "Кабинет 101",
      organization: "ООО Компания",
    },
  })

  const technician = await prisma.user.upsert({
    where: { email: "tech@company.com" },
    update: {},
    create: {
      name: "Анна Сидорова",
      firstName: "Анна",
      lastName: "Сидорова",
      email: "tech@company.com",
      password: hashedPassword,
      role: "TECHNICIAN",
      department: "IT отдел",
      position: "Техник",
      location: "Кабинет 102",
      organization: "ООО Компания",
    },
  })

  const user = await prisma.user.upsert({
    where: { email: "user@company.com" },
    update: {},
    create: {
      name: "Михаил Козлов",
      firstName: "Михаил",
      lastName: "Козлов",
      email: "user@company.com",
      password: hashedPassword,
      role: "USER",
      department: "Бухгалтерия",
      position: "Бухгалтер",
      location: "Кабинет 205",
      organization: "ООО Компания",
    },
  })

  console.log("✅ Пользователи созданы")

  // Создание категорий
  const securityCategory = await prisma.category.upsert({
    where: { slug: "security" },
    update: {},
    create: {
      name: "Безопасность",
      description: "Вопросы информационной безопасности",
      slug: "security",
    },
  })

  const hardwareCategory = await prisma.category.upsert({
    where: { slug: "hardware" },
    update: {},
    create: {
      name: "Оборудование",
      description: "Техническое оборудование и устройства",
      slug: "hardware",
    },
  })

  console.log("✅ Категории созданы")

  // Создание тегов
  const passwordTag = await prisma.tag.upsert({
    where: { slug: "password" },
    update: {},
    create: {
      name: "пароль",
      slug: "password",
    },
  })

  const printerTag = await prisma.tag.upsert({
    where: { slug: "printer" },
    update: {},
    create: {
      name: "принтер",
      slug: "printer",
    },
  })

  console.log("✅ Теги созданы")

  // Создание статей базы знаний
  const passwordArticle = await prisma.knowledgeArticle.upsert({
    where: { slug: "password-change" },
    update: {},
    create: {
      title: "Как быстро сменить пароль",
      content: `# Как быстро сменить пароль

Чтобы изменить пароль, зайдите в настройки аккаунта, выберите раздел «Безопасность» и нажмите «Изменить пароль». Введите текущий пароль, затем новый и подтвердите его. Сохраните изменения — теперь ваш аккаунт защищён новым паролем.

## Пошаговая инструкция:

1. Войдите в свой аккаунт
2. Перейдите в раздел «Настройки»
3. Выберите вкладку «Безопасность»
4. Нажмите на кнопку «Изменить пароль»
5. Введите ваш текущий пароль
6. Введите новый пароль
7. Подтвердите новый пароль, введя его повторно
8. Нажмите кнопку «Сохранить изменения»

## Важно:

- Используйте надежные пароли, содержащие буквы, цифры и специальные символы
- Не используйте один и тот же пароль для разных сервисов
- Регулярно меняйте пароли для повышения безопасности`,
      slug: "password-change",
      authorId: admin.id,
      categoryId: securityCategory.id,
      publishedAt: new Date(),
      featured: true,
    },
  })

  const printerArticle = await prisma.knowledgeArticle.upsert({
    where: { slug: "printer-setup" },
    update: {},
    create: {
      title: "Настройка принтера",
      content: `# Настройка принтера

Подробная инструкция по подключению и настройке принтера в корпоративной сети.

## Подключение принтера

1. Подключите принтер к сети
2. Установите драйверы
3. Добавьте принтер в систему

## Настройка печати

- Выберите качество печати
- Настройте параметры бумаги
- Проверьте работу принтера`,
      slug: "printer-setup",
      authorId: technician.id,
      categoryId: hardwareCategory.id,
      publishedAt: new Date(),
      featured: false,
    },
  })

  console.log("✅ Статьи созданы")

  // Связывание статей с тегами
  await prisma.tagsOnArticles.createMany({
    data: [
      { articleId: passwordArticle.id, tagId: passwordTag.id },
      { articleId: printerArticle.id, tagId: printerTag.id },
    ],
    skipDuplicates: true,
  })

  // Создание заявок
  const ticket1 = await prisma.ticket.create({
    data: {
      title: "Не работает принтер HP LaserJet",
      description: "Принтер не печатает, выдает ошибку подключения. Пробовали перезагрузить, не помогло.",
      status: "OPEN",
      priority: "HIGH",
      creatorId: user.id,
      department: "Бухгалтерия",
      location: "3 этаж, кабинет 305",
      equipmentType: "printer",
    },
  })

  const ticket2 = await prisma.ticket.create({
    data: {
      title: "Настройка нового ноутбука",
      description:
        "Требуется настроить новый ноутбук для нового сотрудника: установить корпоративное ПО, настроить почту и доступы.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      creatorId: user.id,
      assigneeId: technician.id,
      department: "Отдел продаж",
      location: "2 этаж, кабинет 210",
      equipmentType: "computer",
    },
  })

  // Создание комментариев
  await prisma.comment.create({
    data: {
      content: "Приступил к настройке. Установка ПО займет около 2 часов.",
      authorId: technician.id,
      ticketId: ticket2.id,
    },
  })

  console.log("✅ Заявки и комментарии созданы")

  console.log("🎉 База данных успешно заполнена!")
  console.log("\n📧 Тестовые аккаунты:")
  console.log("Администратор: admin@company.com / password123")
  console.log("Техник: tech@company.com / password123")
  console.log("Пользователь: user@company.com / password123")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
