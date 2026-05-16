// Theme tags for the /companies page filter and badge rendering.
// Keep slugs stable — they're used in URL search params.

export const THEMES = {
  AI: { slug: "ai", label: "AI" },
  SEMI: { slug: "semi", label: "Semiconductors" },
  CLOUD: { slug: "cloud", label: "Cloud / SaaS" },
  SPACE: { slug: "space", label: "Space" },
  DEFENSE: { slug: "defense", label: "Defense" },
  FINANCE: { slug: "finance", label: "Finance" },
  ENERGY: { slug: "energy", label: "Energy" },
  HEALTH: { slug: "health", label: "Healthcare" },
  CONSUMER: { slug: "consumer", label: "Consumer" },
  COMMS: { slug: "comms", label: "Comms / Media" },
  INDUSTRIAL: { slug: "industrial", label: "Industrial" },
  AUTO: { slug: "auto", label: "Auto / EV" },
} as const;

export type ThemeSlug = (typeof THEMES)[keyof typeof THEMES]["slug"];

export const THEME_LIST = Object.values(THEMES);

export function themeLabel(slug: string): string {
  return THEME_LIST.find((t) => t.slug === slug)?.label ?? slug;
}
