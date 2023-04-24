export default class Vector {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  add(vector: Vector) {
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  sub(vector: Vector) {
    return new Vector(this.x - vector.x, this.y - vector.y);
  }

  mult(value: number) {
    return new Vector(this.x * value, this.y * value);
  }

  mag() {
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    const mag = this.mag();

    return new Vector(this.x / mag, this.y / mag);
  }
}
