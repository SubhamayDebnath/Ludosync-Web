const EMOJIS = [
  "🦁", "🐯", "🐼", "🦊", "🐸", "🐵", "🐶", "🐱", "🐨", "🐰",
  "🦄", "🐷", "🐧", "🐢", "🦉", "🐙", "🦋", "🐳", "🦖", "🐝",
  "🦈", "🐺", "🦔", "🐔", "🦩", "🐹", "🦜", "🐊", "🐬", "🦥",
];

const BG_COLORS = [
  "#FF6B6B", "#FFB454", "#B8F34A", "#5DB8A6", "#A78BFA",
  "#7FB8FF", "#FF9F9F", "#FFD166", "#8AE68A", "#C792EA",
];

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function avatarFor(seed: string): { emoji: string; bg: string } {
  const h = hashSeed(seed || "player");
  return {
    emoji: EMOJIS[h % EMOJIS.length],
    bg: BG_COLORS[Math.floor(h / EMOJIS.length) % BG_COLORS.length],
  };
}
