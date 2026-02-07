// Theme configuration for Valentine cards
export interface ThemeConfig {
  id: string;
  name: string;
  emoji: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    card: string;
  };
  gradient: string;
}

export const themes: ThemeConfig[] = [
  {
    id: "pink",
    name: "Pink",
    emoji: "💗",
    colors: {
      primary: "346 77% 50%",
      secondary: "350 60% 92%",
      accent: "340 70% 60%",
      background: "350 50% 98%",
      foreground: "350 30% 20%",
      muted: "350 15% 45%",
      card: "350 40% 97%",
    },
    gradient: "linear-gradient(135deg, hsl(346 77% 55%) 0%, hsl(340 70% 50%) 100%)",
  },
  {
    id: "red",
    name: "Red",
    emoji: "❤️",
    colors: {
      primary: "0 85% 45%",
      secondary: "0 60% 90%",
      accent: "5 80% 55%",
      background: "0 30% 97%",
      foreground: "0 40% 15%",
      muted: "0 20% 45%",
      card: "0 40% 96%",
    },
    gradient: "linear-gradient(135deg, hsl(0 85% 50%) 0%, hsl(350 80% 40%) 100%)",
  },
  {
    id: "purple",
    name: "Purple",
    emoji: "💜",
    colors: {
      primary: "270 60% 50%",
      secondary: "270 50% 90%",
      accent: "280 55% 55%",
      background: "270 30% 97%",
      foreground: "270 30% 18%",
      muted: "270 15% 45%",
      card: "270 30% 96%",
    },
    gradient: "linear-gradient(135deg, hsl(270 60% 55%) 0%, hsl(280 55% 45%) 100%)",
  },
  {
    id: "blue",
    name: "Blue",
    emoji: "💙",
    colors: {
      primary: "220 75% 50%",
      secondary: "220 55% 90%",
      accent: "210 65% 55%",
      background: "220 30% 97%",
      foreground: "220 30% 18%",
      muted: "220 15% 45%",
      card: "220 30% 96%",
    },
    gradient: "linear-gradient(135deg, hsl(220 75% 55%) 0%, hsl(210 65% 45%) 100%)",
  },
  {
    id: "gold",
    name: "Gold",
    emoji: "💛",
    colors: {
      primary: "40 90% 50%",
      secondary: "45 70% 92%",
      accent: "35 85% 50%",
      background: "45 40% 97%",
      foreground: "30 40% 18%",
      muted: "40 20% 45%",
      card: "45 40% 96%",
    },
    gradient: "linear-gradient(135deg, hsl(40 90% 55%) 0%, hsl(35 85% 45%) 100%)",
  },
];

export type DecorationType = "hearts" | "bears" | "stars" | "flowers" | "custom";

export interface DecorationConfig {
  id: DecorationType;
  name: string;
  emoji: string;
  symbols: string[];
}

export const decorations: DecorationConfig[] = [
  {
    id: "hearts",
    name: "Hearts",
    emoji: "💕",
    symbols: ["💕", "💖", "💗", "💓", "💝", "❤️", "🩷", "🤍"],
  },
  {
    id: "bears",
    name: "Teddy Bears",
    emoji: "🧸",
    symbols: ["🧸", "🐻", "🐻‍❄️", "💝", "🎀", "🩷", "💌", "🤍"],
  },
  {
    id: "stars",
    name: "Stars & Sparkles",
    emoji: "⭐",
    symbols: ["⭐", "✨", "🌟", "💫", "🌠", "✦", "★", "🌙"],
  },
  {
    id: "flowers",
    name: "Flowers",
    emoji: "🌸",
    symbols: ["🌸", "🌺", "🌹", "🌷", "💐", "🌻", "🌼", "🪻"],
  },
  {
    id: "custom",
    name: "Custom Image",
    emoji: "🖼️",
    symbols: [],
  },
];

export function getThemeById(id: string): ThemeConfig {
  return themes.find((t) => t.id === id) || themes[0];
}

export function getDecorationById(id: DecorationType): DecorationConfig {
  return decorations.find((d) => d.id === id) || decorations[0];
}
