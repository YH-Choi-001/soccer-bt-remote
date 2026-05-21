<script lang="ts">
  import { onMount } from 'svelte'

  let {
    x = $bindable(0),
    y = $bindable(0),
    panelRadius = 100,
    stickRadius = 30,
    panelColor = '#808080',
    outerPanelColor = '#404040',
    stickColor = '#E0E000',
  }: {
    x: number
    y: number
    panelRadius?: number
    stickRadius?: number
    panelColor?: string
    outerPanelColor?: string
    stickColor?: string
  } = $props()

  const canvasDiameter = $derived((panelRadius + stickRadius) * 2)

  let canvasElement: HTMLCanvasElement

  const panelCenterX = $derived(canvasDiameter / 2)
  const panelCenterY = $derived(canvasDiameter / 2)

  function fillCircle(x: number, y: number, r: number, color: string) {
    const context = canvasElement.getContext('2d')
    if (!context) return
    context.beginPath()
    context.arc(x, y, r, 0, Math.PI * 2)
    context.fillStyle = color
    context.fill()
  }

  function updateJoystickGraphics() {
    fillCircle(panelCenterX, panelCenterY, panelRadius + stickRadius, outerPanelColor)
    fillCircle(panelCenterX, panelCenterY, panelRadius, panelColor)
    fillCircle(
      panelCenterX + x * panelRadius,
      panelCenterY + y * panelRadius,
      stickRadius,
      stickColor
    )
  }

  $effect(() => {
    updateJoystickGraphics()
  })

  let isJoystickPressed: boolean = $state(false)

  const updateJoystickPosition = (rawX: number, rawY: number) => {
    const rect = canvasElement.getBoundingClientRect()
    let relX = (rawX - rect.left - panelCenterX) / panelRadius
    let relY = (rawY - rect.top - panelCenterY) / panelRadius
    const mag = Math.sqrt(relX * relX + relY * relY)
    if (mag > 1) {
      relX /= mag
      relY /= mag
    }
    x = relX
    y = relY
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
    canvasElement.addEventListener('mousedown', mousePressedCallback)
    document.addEventListener('mousemove', mouseMovedCallback)
    document.addEventListener('mouseup', joystickReleasedCallback)

    canvasElement.addEventListener('touchstart', fingerPressedCallback)
    document.addEventListener('touchmove', fingerMovedCallback)
    document.addEventListener('touchend', joystickReleasedCallback)
    document.addEventListener('touchcancel', joystickReleasedCallback)
  })
</script>

<canvas bind:this={canvasElement} width={canvasDiameter} height={canvasDiameter}></canvas>
