import { clamp } from "lodash";
import p5 from "p5";
import { Rectangle } from "../objects/rectangle";
import { Circle } from "../objects/circle";

export type CircleCollection = {
  objectType: "rectangle" | "circle";
  x: number;
  y: number;
  radius: number;
  repeatCount: number;
  jitterFactor: number;
};

export const convertCircleCollection = (
  p: p5,
  collection: CircleCollection
) => {
  const objects = [];

  for (let i = 0; i < collection.repeatCount; i++) {
    const angle = (p.TWO_PI * i) / collection.repeatCount;
    const x =
      clamp(collection.x, 0, p.width) + Math.cos(angle) * collection.radius;
    const y =
      clamp(collection.y, 0, p.height) + Math.sin(angle) * collection.radius;

    if (collection.objectType === "rectangle") {
      objects.push(new Rectangle({ x, y }));
    } else {
      objects.push(new Circle({ x, y }));
    }
  }

  return objects.map((obj) => obj.jitter(p, collection.jitterFactor));
};
