
# CRM Task Manager (SBIS Style) MVP

Система управления задачами с упором на аналитику, роли и интуитивно понятный интерфейс.

## Архитектура
1.  **Backend**: Django 4.2 + DRF. Авторизация через SimpleJWT.
2.  **Frontend**: React 18 + Vite + Tailwind CSS.
3.  **Real-time**: Django Channels (WebSockets) для мгновенных уведомлений.
4.  **Database**: PostgreSQL 15.

## Основные возможности
- **Канбан-доска**: Интуитивное управление статусами.
- **Умное назначение**: ИИ-подсказки при выборе исполнителя на основе загрузки.
- **Аналитика**: Наглядные дашборды с КПЭ сотрудников.
- **Логирование**: Полная история изменений каждой задачи.

## Быстрый запуск (Docker)

1. Клонируйте репозиторий.
2. Создайте `.env` файл (см. пример).
3. Запустите контейнеры:
   ```bash
   docker-compose up --build
   ```
4. Примените миграции:
   ```bash
   docker-compose exec backend python manage.py migrate
   ```
5. Создайте суперпользователя:
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

Интерфейс будет доступен по адресу `http://localhost:3000`.
API Documentation (Swagger): `http://localhost:8000/swagger/`.

## Тестирование
- Бэкенд: `pytest`
- Фронтенд: `vitest`
