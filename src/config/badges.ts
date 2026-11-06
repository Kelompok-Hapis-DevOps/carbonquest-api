export type BadgeCategory = "points" | "mission" | "quiz" | "streak";

export interface BadgeDefinition {
  code: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  threshold: number;
}

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    code: "first_mission",
    name: "Langkah Pertama",
    description: "Menyelesaikan misi pertama",
    icon: "🌱",
    category: "mission",
    threshold: 1,
  },
  {
    code: "mission_master",
    name: "Pejuang Misi",
    description: "Menyelesaikan 10 misi",
    icon: "🎯",
    category: "mission",
    threshold: 10,
  },
  {
    code: "first_quiz",
    name: "Kuis Pertama",
    description: "Menjawab pertanyaan kuis pertama",
    icon: "📝",
    category: "quiz",
    threshold: 1,
  },
  {
    code: "quiz_ace",
    name: "Ahli Kuis",
    description: "Menjawab 50 pertanyaan kuis",
    icon: "🧠",
    category: "quiz",
    threshold: 50,
  },
  {
    code: "eco_starter",
    name: "Eco Starter",
    description: "Mengumpulkan 100 poin",
    icon: "🍃",
    category: "points",
    threshold: 100,
  },
  {
    code: "green_champion",
    name: "Green Champion",
    description: "Mengumpulkan 500 poin",
    icon: "🏆",
    category: "points",
    threshold: 500,
  },
  {
    code: "carbon_hero",
    name: "Carbon Hero",
    description: "Mengumpulkan 1000 poin",
    icon: "🦸",
    category: "points",
    threshold: 1000,
  },
  {
    code: "streak_3",
    name: "Konsisten 3 Hari",
    description: "Aktif belajar 3 hari berturut-turut",
    icon: "🔥",
    category: "streak",
    threshold: 3,
  },
  {
    code: "streak_7",
    name: "Konsisten 7 Hari",
    description: "Aktif belajar 7 hari berturut-turut",
    icon: "⚡",
    category: "streak",
    threshold: 7,
  },
];
