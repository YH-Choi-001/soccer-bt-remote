/**
 * Landscape mode for phones whose rotation lock is on.
 *
 * Websites cannot override the rotation lock on iOS (`screen.orientation.lock()` is rejected and
 * the manifest `orientation` field is ignored). Instead, when this mode is enabled and the
 * viewport is portrait, the whole app is rotated 90° clockwise with CSS. The user keeps rotation
 * lock on and holds the phone sideways with the charging port on the right, so tilting the phone
 * can never make the OS flip the screen.
 *
 * The CSS lives in `routes/layout.css` and is keyed off the `rotated-landscape` class on `<html>`.
 */

const STORAGE_KEY = 'sbrc:rotated-landscape'

function loadEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function saveEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled))
  } catch {
    // Storage can be unavailable (e.g. private browsing); the mode then lasts for this visit only.
  }
}

class LandscapeRotation {
  /** Whether the user has turned the mode on. */
  enabled: boolean = $state(false)
  /** Whether the viewport is currently portrait. */
  isPortrait: boolean = $state(false)
  /** Whether the app is currently drawn rotated. */
  readonly active: boolean = $derived(this.enabled && this.isPortrait)

  /**
   * Load the saved preference and start tracking the viewport orientation.
   *
   * @returns A function that stops tracking.
   */
  init(): () => void {
    this.enabled = loadEnabled()
    const query = window.matchMedia('(orientation: portrait)')
    const update = () => (this.isPortrait = query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    saveEnabled(enabled)
  }

  /**
   * Convert a vector measured in screen coordinates (e.g. a difference of `clientX`/`clientY`)
   * into the coordinate frame of the app's content, which may be rotated.
   */
  screenToContent(dx: number, dy: number): { x: number; y: number } {
    // Content is rotated 90° clockwise, so content (x, y) appears on screen as (-y, x).
    return this.active ? { x: dy, y: -dx } : { x: dx, y: dy }
  }
}

export const landscapeRotation = new LandscapeRotation()
