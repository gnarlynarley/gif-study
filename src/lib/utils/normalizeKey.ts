export const KEYBIND_KEY_MAP: Partial<Record<string, string>> = {
  ' ': 'space',
};

export default function normalizeKey(key: string): string {
  const lower = key.toLowerCase();

  return KEYBIND_KEY_MAP[lower] ?? lower;
}
