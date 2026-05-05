const HEX_BY_VALUE = {
  black: "#1a1a1a",
  red: "#e53935",
  white: "#ffffff",
  beige: "#d4c4b0",
  silver: "#c4c9ce",
  navy: "#1e3a5f",
  brown: "#6d4c41",
  pink: "#ff99d6",
  gold: "#d4af37",
  green: "#2e7d32",
  blue: "#1565c0",
  yellow: "#fbc02d",
  orange: "#fb8c00",
  purple: "#7b1fa2",
  grey: "#9e9e9e",
  gray: "#9e9e9e",
  transparent: "#e8eef5",
};

export function colorPresetValueToHex(value) {
  if (value == null) return null;
  const key = String(value).trim().toLowerCase();
  if (!key) return null;
  return HEX_BY_VALUE[key] ?? null;
}
