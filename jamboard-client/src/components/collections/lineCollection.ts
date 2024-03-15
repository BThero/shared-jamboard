import { clamp } from "lodash";
import p5 from "p5";
import { Rectangle } from "../objects/rectangle";
import { Circle } from "../objects/circle";

export type LineCollection = {
  objectType: "rectangle" | "circle";
  x: number;
  y: number;
  angle: number;
  repeatCount: number;
  jitterFactor: number;
};

export const convertLineCollection = (p: p5, collection: LineCollection) => {
  let curX = clamp(collection.x, 0, p.width);
  let curY = clamp(collection.y, 0, p.height);
  let step = 20;
  let curCount = 0;
  const objects = [];

  while (
    curX >= 0 &&
    curX < p.width &&
    curY >= 0 &&
    curY < p.height &&
    curCount < collection.repeatCount
  ) {
    curX += Math.cos(collection.angle) * step;
    curY += Math.sin(collection.angle) * step;
    curCount += 1;

    if (collection.objectType === "rectangle") {
      objects.push(
        new Rectangle({
          x: curX,
          y: curY,
          rotate: 0,
          size: 10,
        })
      );
    } else {
      objects.push(
        new Circle({
          x: curX,
          y: curY,
          size: 10,
        })
      );
    }
  }

  return objects.map((obj) => obj.jitter(p, collection.jitterFactor));
};
