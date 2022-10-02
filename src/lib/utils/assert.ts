export function assert<T>(value: T | null | undefined): asserts value is T {
  if (value == null) throw new Error("Value is nullish");
}
