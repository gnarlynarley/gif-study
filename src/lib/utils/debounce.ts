export default function debounce<A extends any[]>(
  func: (...args: A) => any,
  duration: number,
) {
  let timeoutId: number | null = null;
  return function debouncedFunction(...args: A): void {
    timeoutId !== null && clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, duration);
  };
}
