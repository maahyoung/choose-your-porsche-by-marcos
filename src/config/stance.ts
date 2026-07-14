export type StanceOption = {
  id: string;
  name: { en: string; pt: string };
  rideHeightOffset: number;
  label: { en: string; pt: string };
};

export const STANCE_OPTIONS: StanceOption[] = [
  {
    id: "standard",
    name: { en: "Standard", pt: "Original" },
    rideHeightOffset: 0,
    label: { en: "Factory ride height", pt: "Altura original de fábrica" },
  },
  {
    id: "sport",
    name: { en: "Sport", pt: "Esportiva" },
    rideHeightOffset: -0.028,
    label: { en: "Subtle lowered stance", pt: "Levemente mais baixa" },
  },
  {
    id: "track",
    name: { en: "Track", pt: "Pista" },
    rideHeightOffset: -0.05,
    label: { en: "Aggressive track stance", pt: "Postura mais agressiva de pista" },
  },
];

export function getStanceOption(id: string): StanceOption {
  return STANCE_OPTIONS.find((option) => option.id === id) ?? STANCE_OPTIONS[0];
}
