export function assert<T>(
  value: T | null | undefined,
  message = "Value is nullish.",
): asserts value is T {
  if (value == null) throw new Error(`AssertionError: ${message}`);
}
