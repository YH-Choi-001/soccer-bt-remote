/**
 * Request permission to listen to device orientation and attach an event handler.
 *
 * @param listener The event handler to attach to the device orientation event.
 */

import { on } from 'svelte/events'

function addOrientationEventListener(listener: (e: DeviceOrientationEvent) => void): void {
  on(window, 'deviceorientation', listener)
}

function requestListenToOrientation(listener: (e: DeviceOrientationEvent) => void): void {
  if (
    'requestPermission' in DeviceOrientationEvent &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    // The API requires permission — request it
    Promise.all([DeviceOrientationEvent.requestPermission()]).then(([orientationPermission]) => {
      if (orientationPermission === 'granted') {
        addOrientationEventListener(listener)
      }
    })
  } else {
    addOrientationEventListener(listener)
  }
}

export { requestListenToOrientation }
