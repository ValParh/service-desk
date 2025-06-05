-- Создание тестовых данных для демонстрации

-- Очистка существующих данных
TRUNCATE TABLE "User", "Ticket", "Comment", "KnowledgeArticle", "Category", "Tag" RESTART IDENTITY CASCADE;

-- Создание пользователей
INSERT INTO "User" (id, name, "firstName", "lastName", email, password, role, department, position, location, organization) VALUES
('admin-1', 'Иван Петров', 'Иван', 'Петров', 'admin@company.com', '$2b$10$hash', 'ADMIN', 'IT отдел', 'Системный администратор', 'Кабинет 101', 'ООО Компания'),
('tech-1', 'Анна Сидорова', 'Анна', 'Сидорова', 'tech@company.com', '$2b$10$hash', 'TECHNICIAN', 'IT отдел', 'Техник', 'Кабинет 102', 'ООО Компания'),
('user-1', 'Михаил Козлов', 'Михаил', 'Козлов', 'user@company.com', '$2b$10$hash', 'USER', 'Бухгалтерия', 'Бухгалтер', 'Кабинет 205', 'ООО Компания');

-- Создание категорий
INSERT INTO "Category" (id, name, description, slug) VALUES
('cat-1', 'Безопасность', 'Вопросы информационной безопасности', 'security'),
('cat-2', 'Оборудование', 'Техническое оборудование и устройства', 'hardware'),
('cat-3', 'Программное обеспечение', 'Программы и приложения', 'software');

-- Создание тегов
INSERT INTO "Tag" (id, name, slug) VALUES
('tag-1', 'пароль', 'password'),
('tag-2', 'принтер', 'printer'),
('tag-3', 'почта', 'email');

-- Создание статей базы знаний
INSERT INTO "KnowledgeArticle" (id, title, content, slug, "authorId", "categoryId", "publishedAt", featured) VALUES
('article-1', 'Как быстро сменить пароль', 'Подробная инструкция по смене пароля...', 'password-change', 'admin-1', 'cat-1', NOW(), true),
('article-2', 'Настройка принтера', 'Инструкция по подключению принтера...', 'printer-setup', 'tech-1', 'cat-2', NOW(), false);

-- Создание заявок
INSERT INTO "Ticket" (id, title, description, status, priority, "creatorId", "assigneeId", department, location, "equipmentType") VALUES
('ticket-1', 'Не работает принтер', 'Принтер HP LaserJet не печатает документы', 'OPEN', 'HIGH', 'user-1', NULL, 'Бухгалтерия', 'Кабинет 205', 'printer'),
('ticket-2', 'Проблема с почтой', 'Не могу войти в корпоративную почту', 'IN_PROGRESS', 'MEDIUM', 'user-1', 'tech-1', 'Бухгалтерия', 'Кабинет 205', 'software');
