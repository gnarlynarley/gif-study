export default function filterArray<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((i) => i != null) as T[];
}
