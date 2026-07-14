export type WheelFinishOption = {
  id: string;
  name: { en: string; pt: string };
  color: string;
  metalness: number;
  roughness: number;
  envMapIntensity: number;
};

export const WHEEL_FINISH_OPTIONS: WheelFinishOption[] = [
  {
    id: "satin-black",
    name: { en: "Satin Black", pt: "Preto acetinado" },
    color: "#11141a",
    metalness: 0.94,
    roughness: 0.16,
    envMapIntensity: 2.0,
  },
  {
    id: "silver",
    name: { en: "Silver", pt: "Prata" },
    color: "#b8bec5",
    metalness: 0.98,
    roughness: 0.12,
    envMapIntensity: 2.25,
  },
  {
    id: "neodyme",
    name: { en: "Neodyme", pt: "Neodyme" },
    color: "#8b7046",
    metalness: 0.92,
    roughness: 0.18,
    envMapIntensity: 2.1,
  },
];

export function getWheelFinishOption(id: string): WheelFinishOption {
  return (
    WHEEL_FINISH_OPTIONS.find((option) => option.id === id) ??
    WHEEL_FINISH_OPTIONS[0]
  );
}
