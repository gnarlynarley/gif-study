export function calcModulo(value: number, add: number): number {
  return ((value % add) + add) % add;
}

export function toPercentage(min: number, max: number, value: number) {
  return ((value - min) * 100) / (max - min);
}
