export interface ColorSettings {
  hue: number;
  lightness: number;
  theme: 'light' | 'dark';
}

const STORAGE_KEY = 'beatjie-color-settings';
const AVAILABLE_HUES = [50, 100, 150, 200, 250, 300];

export function getDefaultColorSettings(): ColorSettings {
  return {
    hue: AVAILABLE_HUES[Math.floor(Math.random() * AVAILABLE_HUES.length)],
    lightness: 0.9,
    theme: 'light'
  };
}

export function saveColorSettings(settings: ColorSettings): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save color settings:', error);
    return false;
  }
}

export function loadColorSettings(): ColorSettings | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as unknown;

    // Validate structure
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('hue' in parsed) ||
      !('lightness' in parsed) ||
      !('theme' in parsed)
    ) {
      return null;
    }

    const { hue, lightness, theme } = parsed as Record<string, unknown>;

    // Validate types and ranges
    if (
      typeof hue !== 'number' ||
      typeof lightness !== 'number' ||
      typeof theme !== 'string' ||
      !AVAILABLE_HUES.includes(hue) ||
      lightness < 0 ||
      lightness > 1 ||
      (theme !== 'light' && theme !== 'dark')
    ) {
      return null;
    }

    return { hue, lightness, theme: theme as 'light' | 'dark' };
  } catch (error) {
    console.error('Failed to load color settings:', error);
    return null;
  }
}

export function applyColorSettingsToDOM(settings: ColorSettings): void {
  if (typeof document === 'undefined') return;

  const CHROMA = 0.2;
  const user_colour = `oklch(${settings.lightness} ${CHROMA} ${settings.hue})`;
  const black_or_white = settings.theme === 'light' ? 'oklch(0 0 0)' : 'oklch(1 0 0)';

  document.documentElement.style.setProperty('--user-colour', user_colour);
  document.documentElement.style.setProperty('--black-or-white', black_or_white);
}
