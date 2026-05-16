/**
 * Request permission to listen to device orientation and attach an event handler.
 *
 * @param listener The event handler to attach to the device orientation event.
 */

const ORIENTATION_EVENT = 'deviceorientation'

function attachEventHandler(listener: (e: DeviceOrientationEvent) => void): void {
  window.addEventListener(ORIENTATION_EVENT, listener)
}

function requestListenToOrientation(listener: (e: DeviceOrientationEvent) => void): void {
  if (
    'requestPermission' in DeviceOrientationEvent &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    // The API requires permission — request it
    Promise.all([DeviceOrientationEvent.requestPermission()]).then(([orientationPermission]) => {
      if (orientationPermission === 'granted') {
        attachEventHandler(listener)
      }
    })
  } else {
    attachEventHandler(listener)
  }
}

export { requestListenToOrientation }
