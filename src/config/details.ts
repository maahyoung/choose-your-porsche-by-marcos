import type { Language } from "@/config/translations";

export type RoofFinishId = "carbon" | "gloss-black" | "body-color";
export type MirrorFinishId = "body-color" | "carbon" | "gloss-black";
export type ExhaustFinishId = "matte-black" | "gloss-black" | "metallic";
export type EnvironmentId = "showroom" | "studio" | "night";
export type CameraPresetId =
  | "three-quarter"
  | "front"
  | "rear"
  | "side"
  | "cockpit";

type NamedOption<T extends string> = {
  id: T;
  name: Record<Language, string>;
  preview: string;
};

export const ROOF_FINISH_OPTIONS: NamedOption<RoofFinishId>[] = [
  {
    id: "carbon",
    name: { en: "Carbon fiber", pt: "Fibra de carbono" },
    preview: "linear-gradient(135deg, #11161d 0 42%, #252c34 42% 52%, #090c10 52%)",
  },
  {
    id: "gloss-black",
    name: { en: "Gloss black", pt: "Preto brilhante" },
    preview: "linear-gradient(145deg, #050608, #25282d 48%, #030405)",
  },
  {
    id: "body-color",
    name: { en: "Body color", pt: "Cor da carroceria" },
    preview: "linear-gradient(145deg, #f6f6f2, #bfc3c6)",
  },
];

export const MIRROR_FINISH_OPTIONS: NamedOption<MirrorFinishId>[] = [
  {
    id: "body-color",
    name: { en: "Body color", pt: "Cor da carroceria" },
    preview: "linear-gradient(145deg, #f6f6f2, #bfc3c6)",
  },
  {
    id: "carbon",
    name: { en: "Carbon fiber", pt: "Fibra de carbono" },
    preview: "linear-gradient(135deg, #11161d 0 42%, #252c34 42% 52%, #090c10 52%)",
  },
  {
    id: "gloss-black",
    name: { en: "Gloss black", pt: "Preto brilhante" },
    preview: "linear-gradient(145deg, #050608, #25282d 48%, #030405)",
  },
];

export const EXHAUST_FINISH_OPTIONS: NamedOption<ExhaustFinishId>[] = [
  {
    id: "matte-black",
    name: { en: "Matte black", pt: "Preto fosco" },
    preview: "linear-gradient(145deg, #121519, #272b31)",
  },
  {
    id: "gloss-black",
    name: { en: "Gloss black", pt: "Preto brilhante" },
    preview: "linear-gradient(145deg, #040507, #2d3035 50%, #050608)",
  },
  {
    id: "metallic",
    name: { en: "Metallic", pt: "Metálico" },
    preview: "linear-gradient(145deg, #515861, #f1f3f4 48%, #6b737c)",
  },
];

export const ENVIRONMENT_OPTIONS: NamedOption<EnvironmentId>[] = [
  {
    id: "showroom",
    name: { en: "Bright showroom", pt: "Showroom claro" },
    preview: "linear-gradient(145deg, #ffffff, #dce3e9)",
  },
  {
    id: "studio",
    name: { en: "Dark studio", pt: "Estúdio escuro" },
    preview: "linear-gradient(145deg, #4b5057, #111419)",
  },
  {
    id: "night",
    name: { en: "Night", pt: "Noturno" },
    preview: "linear-gradient(145deg, #172943, #050913)",
  },
];

export const CAMERA_PRESET_OPTIONS: NamedOption<CameraPresetId>[] = [
  {
    id: "three-quarter",
    name: { en: "Three-quarter", pt: "Três quartos" },
    preview: "linear-gradient(135deg, #f8fafb 0 52%, #9da7b0 52%)",
  },
  {
    id: "front",
    name: { en: "Front", pt: "Frontal" },
    preview: "linear-gradient(90deg, #d5dce2 0 28%, #f8fafb 28% 72%, #d5dce2 72%)",
  },
  {
    id: "rear",
    name: { en: "Rear", pt: "Traseira" },
    preview: "linear-gradient(90deg, #252b31 0 28%, #bfc6cc 28% 72%, #252b31 72%)",
  },
  {
    id: "side",
    name: { en: "Profile", pt: "Perfil" },
    preview: "linear-gradient(180deg, #eef2f5 0 58%, #98a2ab 58%)",
  },
  {
    id: "cockpit",
    name: { en: "Cockpit", pt: "Cockpit" },
    preview: "radial-gradient(circle at 50% 70%, #5c646d 0 22%, #171b20 23% 48%, #090b0e 49%)",
  },
];

function getOption<T extends string>(options: NamedOption<T>[], id: T) {
  return options.find((option) => option.id === id) ?? options[0];
}

export const getRoofFinish = (id: RoofFinishId) =>
  getOption(ROOF_FINISH_OPTIONS, id);
export const getMirrorFinish = (id: MirrorFinishId) =>
  getOption(MIRROR_FINISH_OPTIONS, id);
export const getExhaustFinish = (id: ExhaustFinishId) =>
  getOption(EXHAUST_FINISH_OPTIONS, id);
export const getEnvironment = (id: EnvironmentId) =>
  getOption(ENVIRONMENT_OPTIONS, id);
export const getCameraPreset = (id: CameraPresetId) =>
  getOption(CAMERA_PRESET_OPTIONS, id);
