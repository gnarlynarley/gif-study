export default function parseTime(time: number): string {
  return `${time.toFixed(1).replace(".0", "")} seconds`;
}
