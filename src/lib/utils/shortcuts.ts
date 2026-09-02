const STORAGE_KEY = 'beatjie-shortcuts'

// single-key shortcuts must be switchable off (WCAG 2.1.4). default: on
export function loadShortcutsEnabled(): boolean {
  if (typeof localStorage === 'undefined') return true
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

export function saveShortcutsEnabled(enabled: boolean): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off')
  } catch (error) {
    console.error('Failed to save shortcut setting:', error)
  }
}
