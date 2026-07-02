export default function getFilename(fileName: string) {
  const parts = fileName.split('.');
  parts.pop();
  return parts.join('.');
}
