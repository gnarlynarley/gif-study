export function calcModulo(a: number, b: number): number {
  return ((a % b) + b) % b;
}

export function toPercentage(min: number, max: number, value: number) {
  return ((value - min) * 100) / (max - min);
}
