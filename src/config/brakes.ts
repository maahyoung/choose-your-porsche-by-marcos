export type CaliperOption = {
  id: string;
  name: { en: string; pt: string };
  color: string;
  metalness: number;
  roughness: number;
  envMapIntensity: number;
};

export const CALIPER_OPTIONS: CaliperOption[] = [
  {
    id: "red",
    name: { en: "Red", pt: "Vermelho" },
    color: "#d20b1c",
    metalness: 0.38,
    roughness: 0.24,
    envMapIntensity: 1.35,
  },
  {
    id: "yellow",
    name: { en: "Yellow", pt: "Amarelo" },
    color: "#ffd000",
    metalness: 0.34,
    roughness: 0.22,
    envMapIntensity: 1.45,
  },
  {
    id: "black",
    name: { en: "High Gloss Black", pt: "Preto alto brilho" },
    color: "#111318",
    metalness: 0.52,
    roughness: 0.14,
    envMapIntensity: 1.9,
  },
];

export function getCaliperOption(id: string): CaliperOption {
  return CALIPER_OPTIONS.find((option) => option.id === id) ?? CALIPER_OPTIONS[0];
}
