export default function styleString(
  styles: Record<string, string | number>,
): string {
  return Object.entries(styles).reduce(
    (acc, [property, value]) => acc + `${property}:${value};`,
    "",
  );
}
