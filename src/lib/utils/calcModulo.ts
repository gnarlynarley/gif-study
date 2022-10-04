export function calcModulo(value: number, add: number): number {
  return ((value % add) + add) % add;
}
