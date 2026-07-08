export default function wrapSlice<T>(
  arr: T[],
  startIndex: number,
  endIndex: number,
): T[] {
  const len = arr.length;
  if (len === 0) return [];

  // normalize in case indices are negative or out of bounds
  const start = ((startIndex % len) + len) % len;
  const end = ((endIndex % len) + len) % len;

  if (start <= end) {
    return arr.slice(start, end + 1);
  }
  // wraps around: tail + head
  return [...arr.slice(start), ...arr.slice(0, end + 1)];
}
