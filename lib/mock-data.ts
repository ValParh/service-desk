// Моковые данные для демонстрации

export interface User {
  id: string
  name: string
  email: string
  role: "USER" | "TECHNICIAN" | "ADMIN"
  department?: string
  position?: string
  location?: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  createdAt: string
  resolvedAt?: string
  creator: User
  assignee?: User
  department?: string
  location?: string
  equipmentType?: string
  comments: Comment[]
}

export interface Comment {
  id: string
  content: string
  createdAt: string
  author: User
}

export interface Article {
  id: string
  title: string
  content: string
  slug: string
  createdAt: string
  publishedAt?: string
  viewCount: number
  featured: boolean
  author: User
  category?: string
  tags: string[]
}

// Моковые пользователи
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Иван Петров",
    email: "petrov@company.com",
    role: "ADMIN",
    department: "IT отдел",
    position: "Системный администратор",
    location: "Кабинет 101",
  },
  {
    id: "2",
    name: "Анна Сидорова",
    email: "sidorova@company.com",
    role: "TECHNICIAN",
    department: "IT отдел",
    position: "Техник",
    location: "Кабинет 102",
  },
  {
    id: "3",
    name: "Михаил Козлов",
    email: "kozlov@company.com",
    role: "USER",
    department: "Бухгалтерия",
    position: "Бухгалтер",
    location: "Кабинет 205",
  },
]

// Моковые заявки
export const mockTickets: Ticket[] = [
  {
    id: "REQ-2024-001",
    title: "Не работает принтер HP LaserJet",
    description: "Принтер не печатает, выдает ошибку подключения. Пробовали перезагрузить, не помогло.",
    status: "OPEN",
    priority: "HIGH",
    createdAt: "2024-01-15T10:30:00Z",
    creator: mockUsers[2],
    department: "Бухгалтерия",
    location: "3 этаж, кабинет 305",
    equipmentType: "printer",
    comments: [],
  },
  {
    id: "REQ-2024-002",
    title: "Настройка нового ноутбука",
    description:
      "Требуется настроить новый ноутбук для нового сотрудника: установить корпоративное ПО, настроить почту и доступы.",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    createdAt: "2024-01-14T14:15:00Z",
    creator: mockUsers[2],
    assignee: mockUsers[1],
    department: "Отдел продаж",
    location: "2 этаж, кабинет 210",
    equipmentType: "computer",
    comments: [
      {
        id: "1",
        content: "Приступил к настройке. Установка ПО займет около 2 часов.",
        createdAt: "2024-01-14T15:30:00Z",
        author: mockUsers[1],
      },
    ],
  },
  {
    id: "REQ-2024-003",
    title: "Проблема с доступом к корпоративной почте",
    description:
      "Не могу войти в корпоративную почту. Пароль точно правильный, но система выдает ошибку аутентификации.",
    status: "RESOLVED",
    priority: "MEDIUM",
    createdAt: "2024-01-12T09:45:00Z",
    resolvedAt: "2024-01-12T11:30:00Z",
    creator: mockUsers[2],
    assignee: mockUsers[1],
    department: "Маркетинг",
    location: "4 этаж, кабинет 412",
    equipmentType: "software",
    comments: [
      {
        id: "2",
        content: "Проблема в истекшем пароле. Сбросила пароль и отправила новый на резервную почту.",
        createdAt: "2024-01-12T10:15:00Z",
        author: mockUsers[1],
      },
      {
        id: "3",
        content: "Спасибо, получила новый пароль. Всё работает.",
        createdAt: "2024-01-12T11:00:00Z",
        author: mockUsers[2],
      },
    ],
  },
]

// Моковые статьи базы знаний
export const mockArticles: Article[] = [
  {
    id: "1",
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
    createdAt: "2024-01-10T12:00:00Z",
    publishedAt: "2024-01-10T12:00:00Z",
    viewCount: 156,
    featured: true,
    author: mockUsers[0],
    category: "Безопасность",
    tags: ["пароль", "безопасность", "аккаунт"],
  },
  {
    id: "2",
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
    createdAt: "2024-01-08T10:00:00Z",
    publishedAt: "2024-01-08T10:00:00Z",
    viewCount: 89,
    featured: false,
    author: mockUsers[1],
    category: "Оборудование",
    tags: ["принтер", "настройка", "оборудование"],
  },
]

// Текущий пользователь (для демо)
export const currentUser: User = mockUsers[0] // Администратор для демо
