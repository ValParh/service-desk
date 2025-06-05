# Центр сервисной поддержки

Система управления заявками на техническую поддержку с базой знаний.

## Требования

- Node.js 18+ 
- PostgreSQL 14+
- npm или yarn

## Установка и запуск

### 1. Клонирование и установка зависимостей

\`\`\`bash
# Скачайте код проекта
# Перейдите в папку проекта
cd service-desk

# Установите зависимости
npm install
\`\`\`

### 2. Настройка базы данных

#### Установка PostgreSQL

**Windows:**
1. Скачайте PostgreSQL с https://www.postgresql.org/download/windows/
2. Установите с настройками по умолчанию
3. Запомните пароль для пользователя postgres

**macOS:**
\`\`\`bash
# Через Homebrew
brew install postgresql
brew services start postgresql
\`\`\`

**Linux (Ubuntu/Debian):**
\`\`\`bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
\`\`\`

#### Создание базы данных

\`\`\`bash
# Войдите в PostgreSQL
sudo -u postgres psql

# Создайте базу данных
CREATE DATABASE service_desk;

# Создайте пользователя (опционально)
CREATE USER service_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE service_desk TO service_user;

# Выйдите
\q
\`\`\`

### 3. Настройка переменных окружения

\`\`\`bash
# Скопируйте файл примера
cp .env.example .env

# Отредактируйте .env файл
nano .env
\`\`\`

Заполните переменные:
\`\`\`env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/service_desk"
NEXTAUTH_SECRET="your-very-long-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"
\`\`\`

### 4. Инициализация базы данных

\`\`\`bash
# Генерация Prisma клиента
npm run db:generate

# Применение миграций
npm run db:push

# Заполнение тестовыми данными (опционально)
npm run db:seed
\`\`\`

### 5. Запуск приложения

\`\`\`bash
# Запуск в режиме разработки
npm run dev
\`\`\`

Откройте http://localhost:3000 в браузере.

## Полезные команды

\`\`\`bash
# Просмотр базы данных
npm run db:studio

# Создание новой миграции
npm run db:migrate

# Сборка для продакшена
npm run build

# Запуск продакшен версии
npm run start
\`\`\`

## Структура проекта

\`\`\`
service-desk/
├── app/                    # Next.js App Router
│   ├── api/               # API маршруты
│   ├── auth/              # Страницы авторизации
│   ├── knowledge/         # База знаний
│   ├── requests/          # Управление заявками
│   └── profile/           # Профиль пользователя
├── components/            # React компоненты
│   └── ui/               # shadcn/ui компоненты
├── lib/                   # Утилиты и конфигурация
├── prisma/               # Схема базы данных
├── actions/              # Server Actions
└── hooks/                # React хуки
\`\`\`

## Функционал

### Для пользователей:
- ✅ Создание заявок на техподдержку
- ✅ Просмотр статуса своих заявок
- ✅ Комментирование заявок
- ✅ Просмотр базы знаний
- ✅ Управление профилем

### Для техников:
- ✅ Просмотр всех заявок
- ✅ Назначение заявок на себя
- ✅ Изменение статуса заявок
- ✅ Комментирование заявок

### Для администраторов:
- ✅ Полное управление заявками
- ✅ Назначение исполнителей
- ✅ Создание и редактирование статей базы знаний
- ✅ Управление пользователями
- ✅ Статистика и отчеты

## Тестовые аккаунты

После запуска `npm run db:seed` будут созданы тестовые аккаунты:

- **Администратор**: admin@company.com / password123
- **Техник**: tech@company.com / password123  
- **Пользователь**: user@company.com / password123

## Решение проблем

### Ошибка подключения к базе данных
1. Проверьте, что PostgreSQL запущен
2. Убедитесь, что DATABASE_URL правильный
3. Проверьте права доступа пользователя

### Ошибки Prisma
\`\`\`bash
# Сброс базы данных
npx prisma migrate reset

# Повторная генерация клиента
npm run db:generate
\`\`\`

### Ошибки NextAuth
1. Убедитесь, что NEXTAUTH_SECRET установлен
2. Проверьте NEXTAUTH_URL для вашего домена

## Развертывание

### Vercel (рекомендуется)
1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения
3. Подключите PostgreSQL (Neon, Supabase, или другой)

### Docker
\`\`\`bash
# Сборка образа
docker build -t service-desk .

# Запуск контейнера
docker run -p 3000:3000 service-desk
\`\`\`

## Поддержка

Если возникли проблемы:
1. Проверьте логи: `npm run dev`
2. Убедитесь, что все зависимости установлены
3. Проверьте переменные окружения
4. Убедитесь, что база данных доступна
