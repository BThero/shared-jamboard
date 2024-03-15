import p5 from "p5";

export type Drawable = {
  draw: (p: p5, color: p5.Color) => void;
  jitter: (p: p5, mag: number) => Drawable;
};
