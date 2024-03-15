import p5 from "p5";

type CircleFields = {
  x: number;
  y: number;
  size?: number;
};

export class Circle {
  x: number;
  y: number;
  size: number;

  constructor(data: CircleFields) {
    this.x = data.x;
    this.y = data.y;
    this.size = data.size ?? 10;
  }

  draw(p: p5, color: p5.Color): void {
    p.push();
    p.translate(this.x, this.y);
    p.fill(color);
    p.noStroke();
    p.ellipse(0, 0, this.size);
    p.pop();
  }

  jitter(p: p5, mag: number): Circle {
    const newProps = { ...this };
    newProps.x += p.random(-mag, mag);
    newProps.y += p.random(-mag, mag);
    return new Circle(newProps);
  }
}
