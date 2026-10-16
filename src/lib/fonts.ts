export type FontOption = {
  id: string;
  name: string;
  stack: string;
  google?: string; // google fonts family query, e.g. "Fredoka:wght@400;500;600;700"
  category: "display" | "body" | "both";
};

export const FONTS: FontOption[] = [
  // Playful / display-friendly
  { id: "fredoka", name: "Fredoka", stack: "'Fredoka', system-ui, sans-serif", google: "Fredoka:wght@400;500;600;700", category: "both" },
  { id: "quicksand", name: "Quicksand", stack: "'Quicksand', system-ui, sans-serif", google: "Quicksand:wght@400;500;600;700", category: "both" },
  { id: "nunito", name: "Nunito", stack: "'Nunito', system-ui, sans-serif", google: "Nunito:wght@400;500;600;700;800", category: "both" },
  { id: "poppins", name: "Poppins", stack: "'Poppins', system-ui, sans-serif", google: "Poppins:wght@400;500;600;700", category: "both" },
  { id: "comfortaa", name: "Comfortaa", stack: "'Comfortaa', system-ui, sans-serif", google: "Comfortaa:wght@400;500;600;700", category: "display" },
  { id: "pacifico", name: "Pacifico", stack: "'Pacifico', cursive", google: "Pacifico", category: "display" },
  { id: "caveat", name: "Caveat", stack: "'Caveat', cursive", google: "Caveat:wght@400;500;600;700", category: "display" },
  { id: "lobster", name: "Lobster", stack: "'Lobster', cursive", google: "Lobster", category: "display" },
  { id: "bubblegum", name: "Bubblegum Sans", stack: "'Bubblegum Sans', cursive", google: "Bubblegum+Sans", category: "display" },
  { id: "baloo", name: "Baloo 2", stack: "'Baloo 2', system-ui, sans-serif", google: "Baloo+2:wght@400;500;600;700;800", category: "both" },
  // Classic / serious
  { id: "inter", name: "Inter", stack: "'Inter', system-ui, sans-serif", google: "Inter:wght@400;500;600;700", category: "body" },
  { id: "fraunces", name: "Fraunces", stack: "'Fraunces', Georgia, serif", google: "Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700", category: "display" },
  { id: "playfair", name: "Playfair Display", stack: "'Playfair Display', Georgia, serif", google: "Playfair+Display:wght@400;600;700", category: "display" },
  { id: "dm-serif", name: "DM Serif Display", stack: "'DM Serif Display', Georgia, serif", google: "DM+Serif+Display", category: "display" },
  { id: "space-grotesk", name: "Space Grotesk", stack: "'Space Grotesk', system-ui, sans-serif", google: "Space+Grotesk:wght@400;500;600;700", category: "both" },
];

const LOADED = new Set<string>();
export const loadFont = (font: FontOption) => {
  if (!font.google || LOADED.has(font.id) || typeof document === "undefined") return;
  const href = `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.fontId = font.id;
  document.head.appendChild(link);
  LOADED.add(font.id);
};

export const findFont = (id: string) => FONTS.find((f) => f.id === id);
