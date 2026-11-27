export type Language = "es" | "en";
export type StudioTab = "exterior" | "sound";
export type WheelChoice = "oem" | "ar172" | "ar23";
export type TireChoice = "road" | "allterrain";
export type CameraView = "threequarter" | "side" | "front" | "rear" | "other" | "top";
export type ModelOrientation = "auto" | "zup";
export type Build = {
  paint: string;
  wheels: WheelChoice;
  tires: TireChoice;
  rack: boolean;
  steps: boolean;
  exhaust: "original" | "chrome";
  intake: "oem" | "kn";
  muffler: "oem" | "walker";
  dampers: "oem" | "bilstein";
};
export type Fit = {
  wheelbase: number;
  track: number;
  radius: number;
  height: number;
  invertDirection: boolean;
  orientation: ModelOrientation;
};
export type ModelStatus = { kind: "loading" | "ready" | "missing" | "error"; message: string };

export const DEFAULT_BUILD: Build = {
  paint: "#172b4d",
  wheels: "oem",
  tires: "road",
  rack: true, // FORD LAB 013: baca visible de inicio; el usuario puede desactivarla
  steps: false,
  exhaust: "original",
  intake: "oem",
  muffler: "oem",
  dampers: "oem",
};
export const DEFAULT_FIT: Fit = {
  wheelbase: 3.50,
  track: 2.05,
  radius: 0.40,
  height: 0.40,
  invertDirection: false,
  orientation: "auto",
};

export const VANMOTION_FORD_IMAGES = [
  "https://ktv2mbiitjdceynn.public.blob.vercel-storage.com/vehicles/cmrm2i93y0001jq04awn01yv0/chatgpt-image-15-jul-2026-14_10_39-1--MaSZrW5OnrSj0ciKTGfYtpAVCmUOZS.png",
  "https://ktv2mbiitjdceynn.public.blob.vercel-storage.com/vehicles/cmrm2i93y0001jq04awn01yv0/chatgpt-image-15-jul-2026-14_10_39-2--3eYfgKHnce1obxQAixYVk66et5sknK.png",
  "https://ktv2mbiitjdceynn.public.blob.vercel-storage.com/vehicles/cmrm2i93y0001jq04awn01yv0/1784136429293-1-chatgpt-image-15-jul-2026-14_10_39-3--cnRsRB0192sJKMxq744bDUOHq1ro4b.png",
  "https://ktv2mbiitjdceynn.public.blob.vercel-storage.com/vehicles/cmrm2i93y0001jq04awn01yv0/1784136439963-4-chatgpt-image-15-jul-2026-14_10_41-6--h8nJ2cmUzNHxCdmFDXE8aJOZFBC15u.png",
] as const;

export function describeColor(hex:string): string {
  return ({"#172b4d":"Atlantic Blue","#090b0e":"Obsidian Black","#f1ede7":"Oxford White","#707677":"Graphite Silver","#5e201a":"Burgundy Red"} as Record<string,string>)[hex] || hex;
}
