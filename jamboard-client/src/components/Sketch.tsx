import p5 from "p5";
import styles from "./Sketch.module.css";
import { clamp } from "lodash";
import {
  LineCollection,
  convertLineCollection,
} from "./collections/lineCollection";
import { Drawable } from "./collections";
import {
  CircleCollection,
  convertCircleCollection,
} from "./collections/circleCollection";
import { Socket } from "socket.io-client";
import { Circle } from "./objects/circle";
import { Rectangle } from "./objects/rectangle";

type Controls =
  | ({
      type: "line";
    } & Omit<LineCollection, "x" | "y">)
  | ({
      type: "circle";
    } & Omit<CircleCollection, "x" | "y">);

const jitter = {
  initialValue: 0.5,
  scaling: 1.1,
  limit: 10,
  frameCount: 60,
};

type User = {
  id: string;
  color: string;
  placedObjects: Drawable[];
};

const createSketch = (p: p5, socket: Socket) => {
  const cssColor = (r: number, g: number, b: number, a: number) =>
    p.color(r, g, b, Math.floor(a * 255));

  const width = 800;
  const height = 800;
  let controls: Controls = {
    type: "line",
    angle: 0,
    repeatCount: 20,
    objectType: "rectangle",
    jitterFactor: jitter.initialValue,
  };
  const pressedKeys = {
    leftArrow: false,
    rightArrow: false,
    upArrow: false,
    downArrow: false,
  };
  const userColorOpaque = cssColor(255, 255, 255, 0.5);
  let currentObjects: (Circle | Rectangle)[] = [];
  let jitterFrameCounter: number = 0;
  let users: User[] = [];

  socket.on("update", (data) => {
    users = [];

    for (const user of data.users) {
      const newUser: User = {
        id: user.id,
        color: user.color,
        placedObjects: [],
      };

      for (const object of user.placedObjects) {
        if (object.type === "circle") {
          newUser.placedObjects.push(
            new Circle({
              x: object.x,
              y: object.y,
            })
          );
        } else if (object.type === "rectangle") {
          newUser.placedObjects.push(
            new Rectangle({
              x: object.x,
              y: object.y,
            })
          );
        }
      }

      users.push(newUser);
    }
  });

  p.setup = () => {
    p.createCanvas(width, height);
    p.frameRate(60);
  };

  const handlePressedKeys = () => {
    if (pressedKeys.leftArrow) {
      if (controls.type === "line") {
        controls.angle -= 0.1;
      } else {
        controls.radius = clamp(controls.radius - 1, 10, 200);
      }
    }
    if (pressedKeys.rightArrow) {
      if (controls.type === "line") {
        controls.angle += 0.1;
      } else {
        controls.radius = clamp(controls.radius + 1, 10, 200);
      }
    }
    if (pressedKeys.upArrow) {
      controls.repeatCount = clamp(controls.repeatCount + 1, 1, 20);
    }
    if (pressedKeys.downArrow) {
      controls.repeatCount = clamp(controls.repeatCount - 1, 1, 20);
    }
  };

  p.draw = () => {
    socket.emit("updateRequest");
    jitterFrameCounter += 1;

    if (jitterFrameCounter >= jitter.frameCount) {
      controls.jitterFactor = clamp(
        controls.jitterFactor * jitter.scaling,
        0,
        jitter.limit
      );
      jitterFrameCounter = 0;
    }

    handlePressedKeys();
    p.background(0);

    if (controls.type === "line") {
      currentObjects = convertLineCollection(p, {
        objectType: controls.objectType,
        x: p.mouseX,
        y: p.mouseY,
        angle: controls.angle,
        repeatCount: controls.repeatCount,
        jitterFactor: controls.jitterFactor,
      });
    } else if (controls.type === "circle") {
      currentObjects = convertCircleCollection(p, {
        objectType: controls.objectType,
        x: p.mouseX,
        y: p.mouseY,
        radius: controls.radius,
        repeatCount: controls.repeatCount,
        jitterFactor: controls.jitterFactor,
      });
    }

    for (const user of users) {
      for (const obj of user.placedObjects) {
        obj.draw(p, p.color(user.color));
      }
    }

    for (const obj of currentObjects) {
      obj.draw(p, userColorOpaque);
    }
  };

  p.keyPressed = () => {
    if (p.keyCode === p.LEFT_ARROW) {
      pressedKeys.leftArrow = true;
    } else if (p.keyCode === p.RIGHT_ARROW) {
      pressedKeys.rightArrow = true;
    } else if (p.keyCode === p.UP_ARROW) {
      pressedKeys.upArrow = true;
    } else if (p.keyCode === p.DOWN_ARROW) {
      pressedKeys.downArrow = true;
    } else if (p.keyCode === 32) {
      controls.objectType =
        controls.objectType === "rectangle" ? "circle" : "rectangle";
    } else if (p.keyCode === 67) {
      if (controls.type === "line") {
        controls = {
          ...controls,
          type: "circle",
          radius: 20,
        };
      } else {
        controls = {
          ...controls,
          type: "line",
          angle: 0,
        };
      }
    }
  };

  p.keyReleased = () => {
    if (p.keyCode === p.LEFT_ARROW) {
      pressedKeys.leftArrow = false;
    } else if (p.keyCode === p.RIGHT_ARROW) {
      pressedKeys.rightArrow = false;
    } else if (p.keyCode === p.UP_ARROW) {
      pressedKeys.upArrow = false;
    } else if (p.keyCode === p.DOWN_ARROW) {
      pressedKeys.downArrow = false;
    }
  };

  p.mousePressed = () => {
    socket.emit(
      "placeObjects",
      currentObjects.map((obj) => {
        if (obj instanceof Circle) {
          return {
            type: "circle",
            x: obj.x,
            y: obj.y,
          };
        } else {
          return {
            type: "rectangle",
            x: obj.x,
            y: obj.y,
          };
        }
      })
    );

    jitterFrameCounter = 0;
    controls.jitterFactor = jitter.initialValue;
  };
};

type SketchProps = {
  socket: Socket;
};

export const Sketch = ({ socket }: SketchProps) => (
  <div
    class={styles.container}
    ref={(el) => {
      new p5((p) => createSketch(p, socket), el);
    }}
  />
);
