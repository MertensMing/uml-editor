import encoder from "plantuml-encoder";

export function drawSvg(diagram: string) {
  return "https://pblk.bytedance.com/svg/" + encoder.encode(diagram);
}

export function drawPng(diagram: string) {
  return "https://pblk.bytedance.com/png/" + encoder.encode(diagram);
}
