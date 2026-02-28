# Template Manager

Сучасний менеджер шаблонів з темним інтерфейсом, побудований на Next.js 14, Firebase та TailwindCSS.

## Функціонал

### Авторизація
- Вхід через Email/Пароль
- Вхід через Google
- Автоматичний редірект після входу

### Dashboard (3 колонки)

#### Ліва колонка (навігація)
- Профіль
- Мої шаблони
- Ком'юніті

#### Середня колонка

**Мої шаблони:**
- Список категорій користувача
- Підтримка підкатегорій
- Кнопка "Створити категорію"
- Редагування/видалення категорій

**Ком'юніті:**
- Список користувачів з публічними шаблонами
- Аватар, ім'я, кількість лайків, кількість шаблонів

#### Права колонка

**Мої шаблони:**
- Шаблони вибраної категорії
- Кнопка "Створити шаблон"
- Карточка шаблону з:
  - Назвою
  - Текстом
  - Кнопкою "Копіювати"
  - Перемикачем "Публічний"
  - Кнопками "Редагувати" та "Видалити"

**Ком'юніті:**
- Категорії вибраного користувача
- Публічні шаблони
- Кнопки:
  - "Копіювати"
  - "Додати до моїх шаблонів"
  - "❤️ Лайк"

### Система лайків
- Користувач може поставити лайк лише 1 раз
- Автоматичне оновлення лічильників
- Рейтинг користувачів за кількістю лайків

## Технології

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **TailwindCSS**
- **Firebase** (Auth + Firestore)
- **Framer Motion** (анімації)
- **Lucide React** (іконки)

## Встановлення

1. Клонуйте репозиторій:
```bash
git clone <repository-url>
cd template-manager
```

2. Встановіть залежності:
```bash
npm install
```

3. Створіть файл `.env.local` на основі `.env.local.example`:
```bash
cp .env.local.example .env.local
```

4. Додайте ваші Firebase налаштування в `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

5. Запустіть dev сервер:
```bash
npm run dev
```

6. Відкрийте [http://localhost:3000](http://localhost:3000)

## Структура Firestore

### Колекції:

**users**
- id: string
- name: string
- email: string
- avatar: string | null
- totalLikes: number
- createdAt: timestamp

**categories**
- id: string
- userId: string
- name: string
- parentId: string | null
- createdAt: timestamp

**templates**
- id: string
- userId: string
- categoryId: string
- title: string
- content: string
- isPublic: boolean
- likesCount: number
- createdAt: timestamp

**templateLikes**
- id: string
- templateId: string
- userId: string
- createdAt: timestamp

## Структура проекту

```
template-manager/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Головна сторінка dashboard
│   ├── login/
│   │   └── page.tsx          # Сторінка входу
│   ├── register/
│   │   └── page.tsx          # Сторінка реєстрації
│   ├── globals.css           # Глобальні стилі
│   ├── layout.tsx            # Кореневий layout
│   └── page.tsx              # Головна сторінка (редирект)
├── components/
│   └── layout/
│       ├── Sidebar.tsx       # Бічна навігація
│       ├── CategoryList.tsx  # Список категорій
│       ├── TemplateList.tsx  # Список шаблонів
│       ├── CommunityList.tsx # Список користувачів
│       ├── PublicTemplates.tsx # Публічні шаблони
│       └── ProfileView.tsx   # Профіль користувача
├── context/
│   └── AuthContext.tsx       # Контекст авторизації
├── lib/
│   └── firebase.ts           # Firebase конфігурація
├── types/
│   └── index.ts              # TypeScript типи
├── middleware.ts             # Middleware для захисту роутів
├── next.config.js            # Next.js конфігурація
├── tailwind.config.ts        # TailwindCSS конфігурація
└── package.json
```

## Дизайн

- Темна тема з фіолетовими акцентами
- Сучасний SaaS стиль (Linear / Notion inspired)
- Rounded corners (xl)
- Hover ефекти
- Плавні анімації
- Шрифт Inter
- Українська мова інтерфейсу

## Ліцензія

MIT
