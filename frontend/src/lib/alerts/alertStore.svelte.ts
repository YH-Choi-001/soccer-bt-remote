import { writable } from 'svelte/store'

export type AlertType = 'info' | 'success' | 'warning' | 'error'
type Alert = {
  id: number
  title: string
  message: string
  type: AlertType
}

const DEFAULT_TYPE = 'info'
const DEFAULT_DURATION = 5000

export const alerts = writable<Alert[]>([])

export function addAlert(
  title: string,
  message: string,
  type: AlertType = DEFAULT_TYPE,
  duration: number = DEFAULT_DURATION
): number {
  const id: number = Date.now() + Math.random()

  // Add new alert to the list
  alerts.update((all) => [{ id, title, message, type }, ...all])

  // Remove alert after duration
  if (duration) {
    setTimeout(() => {
      removeAlert(id)
    }, duration)
  }
  return id
}

export function removeAlert(id: number) {
  alerts.update((all) => all.filter((a) => a.id !== id))
}
