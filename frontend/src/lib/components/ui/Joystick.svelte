<script lang="ts">
  import { onMount } from 'svelte'
  import { on } from 'svelte/events'
  import { landscapeRotation } from '$lib/rotation/landscapeRotation.svelte'

  let {
    position = $bindable({ x: 0, y: 0 }),
    listenToMouse = true,
    listenToTouch = true,
    // In landscape, fill the screen height: --app-height minus this panel's 4.5rem of margin and
    // 1.5rem of page padding (ControlPanel's landscape-ui:p-3), capped for tablets.
    panelClass = 'size-48 m-9 border-9 md:size-64 md:m-12 md:border-12 bg-gray-500 border-gray-600 landscape-ui:m-9 landscape-ui:border-9 landscape-ui:size-[min(calc(var(--app-height)_-_6rem),24rem)]',
    stickClass = 'size-18 border-3 md:size-24 md:border-4 bg-radial from-yellow-300 to-yellow-500 border-yellow-500 landscape-ui:size-18 landscape-ui:border-3',
  }: {
    position: { x: number; y: number }
    listenToMouse?: boolean
    listenToTouch?: boolean
    panelClass?: string
    stickClass?: string
  } = $props()

  let panelElement: HTMLElement
  let stickElement: HTMLElement

  let isJoystickPressed: boolean = $state(false)

  export const normalizeJoystickRelativePosition = (pos: {
    x: number
    y: number
  }): { x: number; y: number } => {
    let x = pos.x
    let y = pos.y
    const mag = Math.sqrt(x * x + y * y)
    if (mag > 1) {
      x /= mag
      y /= mag
    }
    return { x, y }
  }

  // Pointer positions arrive in screen coordinates, but the app may be drawn rotated
  // (see $lib/rotation/landscapeRotation.svelte.ts). The panel's centre is the same in both frames,
  // so measure the offset from it on screen, then rotate that offset into the panel's own frame.
  const joystickPositionAbsoluteToRelative = (
    rawX: number,
    rawY: number
  ): { x: number; y: number } => {
    const panelRect = panelElement.getBoundingClientRect()
    const panelMidX = (panelRect.left + panelRect.right) / 2
    const panelMidY = (panelRect.top + panelRect.bottom) / 2
    const local = landscapeRotation.screenToContent(rawX - panelMidX, rawY - panelMidY)
    return {
      x: local.x / (panelElement.offsetWidth / 2),
      y: local.y / (panelElement.offsetHeight / 2),
    }
  }

  // Uses layout offsets (relative to the wrapper, unaffected by CSS transforms).
  const updateJoystickRelativeGraphicalPosition = (relX: number, relY: number) => {
    const panelHalfWidth = panelElement.offsetWidth / 2
    const panelHalfHeight = panelElement.offsetHeight / 2
    const panelMidX = panelElement.offsetLeft + panelHalfWidth
    const panelMidY = panelElement.offsetTop + panelHalfHeight
    const localLeft = panelMidX + relX * panelHalfWidth - stickElement.offsetWidth / 2
    const localTop = panelMidY + relY * panelHalfHeight - stickElement.offsetHeight / 2
    stickElement.style.left = `${localLeft}px`
    stickElement.style.top = `${localTop}px`
  }

  $effect(() => {
    updateJoystickRelativeGraphicalPosition(position.x, position.y)
  })

  // The panel changes size when the layout switches between portrait and landscape,
  // so re-place the stick to keep it aligned with the panel.
  $effect(() => {
    const observer = new ResizeObserver(() =>
      updateJoystickRelativeGraphicalPosition(position.x, position.y)
    )
    observer.observe(panelElement)
    return () => observer.disconnect()
  })

  const updateJoystickPosition = (rawX: number, rawY: number) => {
    position = normalizeJoystickRelativePosition(joystickPositionAbsoluteToRelative(rawX, rawY))
  }

  const mousePressedCallback = (e: MouseEvent) => {
    isJoystickPressed = true
    updateJoystickPosition(e.clientX, e.clientY)
  }

  const mouseMovedCallback = (e: MouseEvent) => {
    if (!isJoystickPressed) return
    updateJoystickPosition(e.clientX, e.clientY)
  }

  const handleTouches = (e: TouchEvent) => {
    if (e.targetTouches.length !== 1) {
      joystickReleasedCallback()
      return
    }
    isJoystickPressed = true
    const touch = e.targetTouches[0]
    updateJoystickPosition(touch.clientX, touch.clientY)
  }

  const fingerPressedCallback = (e: TouchEvent) => {
    handleTouches(e)
  }

  const fingerMovedCallback = (e: TouchEvent) => {
    if (!isJoystickPressed) return
    handleTouches(e)
  }

  const joystickReleasedCallback = () => {
    isJoystickPressed = false
    position = { x: 0, y: 0 }
  }

  onMount(() => {
    joystickReleasedCallback()
  })

  $effect(() => {
    if (listenToMouse) {
      const removeMouseCallbacks: (() => void)[] = [
        on(panelElement, 'mousedown', mousePressedCallback),
        on(stickElement, 'mousedown', mousePressedCallback),
        on(document, 'mousemove', mouseMovedCallback),
        on(document, 'mouseup', joystickReleasedCallback),
      ]
      return () => removeMouseCallbacks.forEach((callback) => callback())
    }
  })

  $effect(() => {
    if (listenToTouch) {
      const removeTouchCallbacks: (() => void)[] = [
        on(panelElement, 'touchstart', fingerPressedCallback),
        on(stickElement, 'touchstart', fingerPressedCallback),
        on(document, 'touchmove', fingerMovedCallback),
        on(document, 'touchend', joystickReleasedCallback),
        on(document, 'touchcancel', joystickReleasedCallback),
      ]
      return () => removeTouchCallbacks.forEach((callback) => callback())
    }
  })
</script>

<div class="relative touch-none">
  <div class="z-10 rounded-full {panelClass}" bind:this={panelElement}></div>
  <div
    class="absolute z-20 rounded-full {listenToMouse
      ? isJoystickPressed
        ? 'cursor-grabbing'
        : 'cursor-grab'
      : ''} {stickClass}"
    bind:this={stickElement}
  ></div>
</div>
