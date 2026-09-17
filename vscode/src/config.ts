export interface HighlighterConfig {
  enabled: boolean;
  token: string;
  defaultColor: string;
  includeMarkers: boolean;
  wholeLine: boolean;
}

export const DEFAULT_TOKEN = "!important";
export const DEFAULT_COLOR = "#e6b422";

const MAX_TOKEN_LENGTH = 64;
const COLOR_PATTERN =
  /^(#[0-9a-fA-F]{3,8}|rgba?\(\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?(?:\s*,\s*[\d.]+%?)?\s*\)|hsla?\(\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?(?:\s*,\s*[\d.]+%?)?\s*\)|[a-zA-Z]{1,32})$/;

export function sanitizeToken(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_TOKEN_LENGTH) {
    return fallback;
  }
  if (!/^!?[A-Za-z][A-Za-z0-9_-]*$/.test(trimmed)) {
    return fallback;
  }
  return trimmed;
}

export function sanitizeColor(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  if (!COLOR_PATTERN.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function parseHexChannel(value: string): number {
  return Number.parseInt(value.length === 1 ? `${value}${value}` : value, 16);
}

export function parseRgb(color: string): Rgb | undefined {
  const hex = /^#([0-9a-fA-F]{3,8})$/.exec(color);
  if (hex) {
    const digits = hex[1];
    if (digits.length === 3 || digits.length === 4) {
      return {
        r: parseHexChannel(digits[0]),
        g: parseHexChannel(digits[1]),
        b: parseHexChannel(digits[2]),
      };
    }
    if (digits.length === 6 || digits.length === 8) {
      return {
        r: parseHexChannel(digits.slice(0, 2)),
        g: parseHexChannel(digits.slice(2, 4)),
        b: parseHexChannel(digits.slice(4, 6)),
      };
    }
  }

  const rgb =
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+)?\s*\)$/.exec(color);
  if (rgb) {
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
    };
  }

  return undefined;
}

export function withAlpha(color: string, alpha: number): string {
  const rgb = parseRgb(color);
  if (rgb) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

export function styleFromColor(color: string): {
  backgroundColor: string;
  borderColor: string;
  overviewRulerColor: string;
} {
  return {
    backgroundColor: withAlpha(color, 0.16),
    borderColor: color,
    overviewRulerColor: withAlpha(color, 0.8),
  };
}

export function loadConfigFrom(settings: {
  get<T>(key: string): T | undefined;
}): HighlighterConfig {
  return {
    enabled: settings.get<boolean>("enabled") !== false,
    token: sanitizeToken(settings.get("token"), DEFAULT_TOKEN),
    defaultColor: sanitizeColor(settings.get("defaultColor")) ?? DEFAULT_COLOR,
    includeMarkers: settings.get<boolean>("includeMarkers") !== false,
    wholeLine: settings.get<boolean>("wholeLine") !== false,
  };
}
