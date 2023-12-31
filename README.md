# «Банк»

Данное SPA-приложение является банковской системой хранения и операций над криптовалютными средствами. Оно разработано для обеспечения основного функционала банковской системы, который включает в себя следующие возможности:

- Авторизация: Пользователи могут войти в систему, используя свои учетные данные.
- Управление счетами пользователя: Пользователи могут создавать новые счета, просматривать список своих счетов, отображать баланс и просматривать историю транзакций для каждого счета.
- Переводы на счета или карты других пользователей: Пользователи могут осуществлять переводы средств на счета или карты других пользователей.
- Валютные обмены: Пользователи могут производить обмен криптовалюты на другие валюты по актуальному обменному курсу.
- Отображение банкоматов на карте: Пользователям предоставляется возможность просмотра ближайших банкоматов на карте, используя API Яндекс.Карт.

## Установка и запуск проекта

Для корректной работы приложения необходимо установить все зависимости с помощью npm. Для этого проследуйте следующим шагам:

1. Убедитесь, что у вас установлен Node.js и npm на вашем компьютере. Если установленны не все, вы можете загрузить и установить их с официального сайта Node.js (https://nodejs.org/).
2. Склонируйте данный репозиторий к себе на компьютер. Затем выполните команду `npm install` в корневой папке проекта для установки всех зависимостей.
3. Запустите серверную часть приложения, выполнив команду:
   `npm run start`
   По умолчанию сервер слушает порт 3000 на локальном хосте.
4. Чтобы запустить сборку в режиме разработки, выполните команду:
   `npm run dev`
5. Чтобы запустить сборку в режиме продакшн, выполните команду:
   `npm run build`
   Теперь вы можете открыть приложение в вашем браузере, обычно по адресу http://localhost:8080.

## Логин и пароль

На данный момент доступен только вход в следующий аккаунт:

- Логин: `developer`
- Пароль: `skillbox`

## Зависимости и технологии

- Front JavaScript 
- Back NodeJS
- Webpack (сборка проекта)
- API Яндекс.Карт для отображения банкоматов
- Графики Chart.js для визуализации данных
- Шаблонизатор Redom.js для генерации динамического контента
- Bootstrap для создания современного и отзывчивого интерфейса

## Тестирование

Приложение также имеет реализацию тестирования с использованием e2e Cypress для проверки работоспособности основного функционала. Чтобы запустить тесты, выполните следующие шаги:

1. Убедитесь, что сервер запущен и приложение работает в режиме разработки (`npm run start` и `npm run dev`).
2. Запустите тесты Cypress, выполнив команду:

`npm run cypress:open`

Тесты позволят вам убедиться, что основной функционал приложения работает корректно и соответствует требованиям.

## Серверное API

./backend/README.md
