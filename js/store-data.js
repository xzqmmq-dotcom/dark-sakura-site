export const products = [
  {
    id: "sakura-01", name: "Sakura Identity", category: "design", categoryLabel: "Дизайн",
    price: 18500, rating: 4.9, popularity: 98, badge: "POPULAR", symbol: "桜",
    artBg: "#21161f", artAccent: "#ffb7c5",
    description: "Визуальная система с японским характером для вашего проекта.",
    tags: ["Айдентика", "Минимализм"]
  },
  {
    id: "sakura-02", name: "Zen Landing", category: "design", categoryLabel: "Дизайн",
    price: 32000, rating: 4.8, popularity: 92, badge: "STUDIO PICK", symbol: "禅",
    artBg: "#171c1b", artAccent: "#c7d6bc",
    description: "Одностраничный сайт с чистой композицией и выразительной типографикой.",
    tags: ["Landing page", "UI/UX"]
  },
  {
    id: "sakura-03", name: "Digital Koi", category: "digital", categoryLabel: "Digital",
    price: 7900, rating: 4.7, popularity: 87, badge: "DIGITAL", symbol: "鯉",
    artBg: "#171a24", artAccent: "#d4af37",
    description: "Цифровой набор графических элементов для контента и интерфейсов.",
    tags: ["Графика", "Набор"]
  },
  {
    id: "sakura-04", name: "Midnight UI Kit", category: "digital", categoryLabel: "Digital",
    price: 12500, rating: 4.9, popularity: 96, badge: "BEST VALUE", symbol: "夜",
    artBg: "#171723", artAccent: "#b8b6ff",
    description: "Коллекция компонентов для тёмных интерфейсов и веб-продуктов.",
    tags: ["UI Kit", "Figma"]
  },
  {
    id: "sakura-05", name: "Tea Ceremony", category: "experience", categoryLabel: "Опыт",
    price: 9500, rating: 5.0, popularity: 83, badge: "EXPERIENCE", symbol: "茶",
    artBg: "#1c1c16", artAccent: "#d4af37",
    description: "Цифровой гид по эстетике чайной церемонии и осознанным ритуалам.",
    tags: ["Гид", "Культура"]
  },
  {
    id: "sakura-06", name: "Quiet Focus", category: "service", categoryLabel: "Сервисы",
    price: 6000, rating: 4.8, popularity: 81, badge: "FOCUS", symbol: "静",
    artBg: "#151c20", artAccent: "#a8cbd0",
    description: "Персональная настройка рабочего пространства для спокойной работы.",
    tags: ["Консультация", "Работа"]
  },
  {
    id: "sakura-07", name: "Wabi-Sabi Pack", category: "digital", categoryLabel: "Digital",
    price: 4900, rating: 4.6, popularity: 76, badge: "ESSENTIALS", symbol: "侘",
    artBg: "#211b17", artAccent: "#d4ad91",
    description: "Текстуры, формы и фоновые элементы с естественной фактурой.",
    tags: ["Текстуры", "Assets"]
  },
  {
    id: "sakura-08", name: "Personal Direction", category: "service", categoryLabel: "Сервисы",
    price: 22000, rating: 4.9, popularity: 90, badge: "1:1 SESSION", symbol: "道",
    artBg: "#1d1720", artAccent: "#e5a5bb",
    description: "Индивидуальная консультация по визуальному направлению проекта.",
    tags: ["Консультация", "Персонально"]
  }
];

export const formatPrice = (amount) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(amount) + " ₸";
