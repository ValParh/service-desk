USE helpdesk_db;

-- Вставка категорий
INSERT INTO categories (name, description, color) VALUES
('Техническая поддержка', 'Общие технические вопросы', '#3B82F6'),
('Оборудование', 'Проблемы с оборудованием', '#EF4444'),
('Программное обеспечение', 'Вопросы по ПО', '#10B981'),
('Сеть', 'Сетевые проблемы', '#F59E0B'),
('Безопасность', 'Вопросы безопасности', '#8B5CF6'),
('Учетные записи', 'Проблемы с доступом', '#EC4899');

-- Вставка пользователей (пароли захешированы для 'password123')
INSERT INTO users (email, password_hash, first_name, last_name, middle_name, phone, role, department, position, employee_id) VALUES
('admin@tplus.ru', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'Александр', 'Сидоров', 'Владимирович', '+7 (495) 345-67-89', 'admin', 'IT отдел', 'Системный администратор', 'EMP001'),
('support@tplus.ru', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'Мария', 'Иванова', 'Александровна', '+7 (495) 234-56-78', 'support', 'Техническая поддержка', 'Специалист поддержки', 'EMP002'),
('client@tplus.ru', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'Иван', 'Петров', 'Сергеевич', '+7 (495) 123-45-67', 'client', 'Отдел продаж', 'Менеджер по продажам', 'EMP003'),
('kozlova@tplus.ru', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'Елена', 'Козлова', 'Петровна', '+7 (495) 456-78-90', 'support', 'Техническая поддержка', 'Старший специалист', 'EMP004'),
('petrov@tplus.ru', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'Сергей', 'Петров', 'Викторович', '+7 (495) 567-89-01', 'support', 'Техническая поддержка', 'Специалист поддержки', 'EMP005');

-- Вставка статей базы знаний
INSERT INTO knowledge_base_articles (title, content, category, tags, author_id, is_published, views, helpful_votes, not_helpful_votes) VALUES
('Как быстро сменить пароль', 'Подробная инструкция по смене пароля в системе...', 'Безопасность', '["пароль", "безопасность", "учетная запись"]', 2, TRUE, 245, 23, 2),
('Настройка принтера', 'Пошаговое руководство по настройке принтера...', 'Оборудование', '["принтер", "оборудование", "настройка"]', 4, TRUE, 189, 18, 1),
('Настройка корпоративной почты', 'Инструкция по настройке почты на различных устройствах...', 'Программное обеспечение', '["почта", "email", "outlook", "настройка"]', 2, TRUE, 156, 15, 0);

-- Вставка тестовых запросов
INSERT INTO tickets (ticket_number, title, description, status, priority, category_id, client_id, assigned_to) VALUES
('TK-001', 'Не работает принтер HP LaserJet', 'Принтер не печатает документы, горит красная лампочка', 'in-progress', 'high', 2, 3, 4),
('TK-002', 'Проблема с доступом к почте', 'Не могу войти в корпоративную почту', 'resolved', 'medium', 6, 3, 2),
('TK-003', 'Медленная работа компьютера', 'Компьютер стал очень медленно работать', 'new', 'low', 1, 3, NULL);

-- Вставка комментариев к запросам
INSERT INTO ticket_comments (ticket_id, author_id, content, is_internal) VALUES
(1, 3, 'Принтер находится в офисе 205, второй этаж', FALSE),
(1, 4, 'Принял в работу. Подойду для диагностики в течение часа', FALSE),
(2, 3, 'Проблема началась вчера утром', FALSE),
(2, 2, 'Сбросил пароль, отправил новый на личную почту', FALSE);
