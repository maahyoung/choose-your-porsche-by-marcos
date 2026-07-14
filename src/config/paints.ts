export type PaintOption = {
  id: string;
  name: { en: string; pt: string };
  color: string;
  metalness: number;
  roughness: number;
};

export const PAINTS: PaintOption[] = [
  {
    id: "white",
    name: { en: "White", pt: "Branco" },
    color: "#f4f4f0",
    metalness: 0.28,
    roughness: 0.24,
  },
  {
    id: "guards-red",
    name: { en: "Guards Red", pt: "Guards Red" },
    color: "#c90812",
    metalness: 0.32,
    roughness: 0.2,
  },
  {
    id: "racing-yellow",
    name: { en: "Racing Yellow", pt: "Racing Yellow" },
    color: "#ffd100",
    metalness: 0.27,
    roughness: 0.23,
  },
  {
    id: "shark-blue",
    name: { en: "Shark Blue", pt: "Shark Blue" },
    color: "#1672c4",
    metalness: 0.34,
    roughness: 0.2,
  },
  {
    id: "python-green",
    name: { en: "Python Green", pt: "Python Green" },
    color: "#47a447",
    metalness: 0.31,
    roughness: 0.22,
  },
  {
    id: "arctic-grey",
    name: { en: "Arctic Grey", pt: "Arctic Grey" },
    color: "#a7a9a6",
    metalness: 0.38,
    roughness: 0.22,
  },
  {
    id: "black",
    name: { en: "Black", pt: "Preto" },
    color: "#111214",
    metalness: 0.42,
    roughness: 0.16,
  },
];

export function getPaint(id: string): PaintOption {
  return PAINTS.find((paint) => paint.id === id) ?? PAINTS[0];
}
