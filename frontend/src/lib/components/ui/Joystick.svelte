<script lang="ts">
  import { onMount } from 'svelte'
  import { on } from 'svelte/events'

  let {
    x = $bindable(0),
    y = $bindable(0),
    panelClass = 'size-64 m-12 bg-gray-500 border-12 border-gray-600',
    stickClass = 'size-24 bg-radial from-yellow-300 to-yellow-500 border-4 border-yellow-500',
  }: {
    x: number
    y: number
    panelClass?: string
    stickClass?: string
  } = $props()

  let wrapperElement: HTMLElement
  let panelElement: HTMLElement
  let stickElement: HTMLElement

  let isJoystickPressed: boolean = $state(false)

  const updateJoystickRelativePosition = (rawX: number, rawY: number) => {
    const panelRect = panelElement.getBoundingClientRect()
    const panelMidX = (panelRect.left + panelRect.right) / 2
    const panelMidY = (panelRect.top + panelRect.bottom) / 2
    const panelHalfWidth = panelRect.width / 2
    const panelHalfHeight = panelRect.height / 2
    let relX = (rawX - panelMidX) / panelHalfWidth
    let relY = (rawY - panelMidY) / panelHalfHeight
    const mag = Math.sqrt(relX * relX + relY * relY)
    if (mag > 1) {
      relX /= mag
      relY /= mag
    }
    x = relX
    y = relY
  }

  const updateJoystickAbsoluteGraphicalPosition = (rawX: number, rawY: number) => {
    const wrapperRect = wrapperElement.getBoundingClientRect()
    const stickRect = stickElement.getBoundingClientRect()
    const localLeft = rawX - wrapperRect.left - stickRect.width / 2
    const localTop = rawY - wrapperRect.top - stickRect.height / 2
    stickElement.style.left = `${localLeft}px`
    stickElement.style.top = `${localTop}px`
  }

  const updateJoystickRelativeGraphicalPosition = (relX: number, relY: number) => {
    const panelRect = panelElement.getBoundingClientRect()
    const panelMidX = (panelRect.left + panelRect.right) / 2
    const panelMidY = (panelRect.top + panelRect.bottom) / 2
    const panelHalfWidth = panelRect.width / 2
    const panelHalfHeight = panelRect.height / 2
    const rawX = relX * panelHalfWidth + panelMidX
    const rawY = relY * panelHalfHeight + panelMidY
    updateJoystickAbsoluteGraphicalPosition(rawX, rawY)
  }

  $effect(() => {
    updateJoystickRelativeGraphicalPosition(x, y)
  })

  const updateJoystickPosition = (rawX: number, rawY: number) => {
    updateJoystickRelativePosition(rawX, rawY)
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
    x = 0
    y = 0
  }

  onMount(() => {
    on(panelElement, 'mousedown', mousePressedCallback)
    on(stickElement, 'mousedown', mousePressedCallback)
    on(document, 'mousemove', mouseMovedCallback)
    on(document, 'mouseup', joystickReleasedCallback)

    on(panelElement, 'touchstart', fingerPressedCallback)
    on(stickElement, 'touchstart', fingerPressedCallback)
    on(document, 'touchmove', fingerMovedCallback)
    on(document, 'touchend', joystickReleasedCallback)
    on(document, 'touchcancel', joystickReleasedCallback)

    joystickReleasedCallback()
  })
</script>

<div class="relative touch-none" bind:this={wrapperElement}>
  <div class="z-10 rounded-full {panelClass}" bind:this={panelElement}></div>
  <div
    class="absolute z-20 rounded-full {isJoystickPressed
      ? 'cursor-grabbing'
      : 'cursor-grab'} {stickClass}"
    bind:this={stickElement}
  ></div>
</div>
