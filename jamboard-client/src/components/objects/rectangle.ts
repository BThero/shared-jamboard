import p5 from "p5";

type RectangleFields = {
  x: number;
  y: number;
  rotate?: number;
  size?: number;
};

export class Rectangle {
  x: number;
  y: number;
  rotate: number;
  size: number;

  constructor(data: RectangleFields) {
    this.x = data.x;
    this.y = data.y;
    this.rotate = data.rotate ?? 0;
    this.size = data.size ?? 10;
  }

  draw(p: p5, color: p5.Color): void {
    p.push();
    p.translate(this.x, this.y);
    p.rotate(this.rotate);
    p.fill(color);
    p.noStroke();
    p.rect(0, 0, this.size, this.size);
    p.pop();
  }

  jitter(p: p5, mag: number): Rectangle {
    const newProps = { ...this };
    newProps.x += p.random(-mag, mag);
    newProps.y += p.random(-mag, mag);
    return new Rectangle(newProps);
  }
}
