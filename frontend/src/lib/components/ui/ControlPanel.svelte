<!--
Control panel for the remote control.
Contains motion control, heading control, and Bluetooth connection.
-->

<script lang="ts">
  import { requestListenToOrientation } from '$lib/orientation/orientation'
  import Serializer from '$lib/components/serializer/Serializer.svelte'
  import BluetoothConnectPanel from '$lib/components/bluetooth/BluetoothConnectPanel.svelte'
  import { addAlert } from '$lib/alerts/alertStore.svelte'
  import Joystick from '$lib/components/ui/Joystick.svelte'

  let {
    motionControl,
    headingControl = null,
    absoluteMaxSpeed = 255,
    gyroMaxTiltAngle = 45,
    angleFix = 2,
    sendIntervalMs = 100,
  }: {
    motionControl: 'joystick' | 'gyro' | 'keyboard'
    headingControl?: 'gyro' | null
    absoluteMaxSpeed?: number
    gyroMaxTiltAngle?: number
    angleFix?: number
    sendIntervalMs?: number
  } = $props()

  // -------------------- motionControl --------------------

  function clamp(value: number, absMax: number): number {
    if (value < -absMax) return -absMax
    if (value > absMax) return absMax
    return value
  }

  function scale(value: number, originAbsMax: number, targetAbsMax: number): number {
    return (value / originAbsMax) * targetAbsMax
  }

  let joystick: Joystick
  let joystickPosition = $state({ x: 0, y: 0 })

  let speedX = $derived(joystickPosition.x)
  let speedY = $derived(-joystickPosition.y)

  const motionAngle: number = $derived((Math.atan2(speedX, speedY) * 180) / Math.PI)
  const motionSpeed: number = $derived(
    clamp(
      scale(Math.sqrt(speedX * speedX + speedY * speedY), 1, absoluteMaxSpeed),
      absoluteMaxSpeed
    )
  )

  // -------------------- motionControl === 'gyro' --------------------

  const isGyroRequired: boolean = $derived(motionControl === 'gyro' || headingControl === 'gyro')

  let orientation: {
    alpha: number
    beta: number
    gamma: number
    timeStamp: number
  } = $state({
    alpha: 0,
    beta: 0,
    gamma: 0,
    timeStamp: 0,
  })

  const orientationAngles: {
    x: number
    y: number
    z: number
  } = $derived({
    x: orientation.beta,
    y: orientation.gamma,
    z: -orientation.alpha,
  })

  const handleOrientation = (e: DeviceOrientationEvent) => {
    if (e.alpha != null) orientation.alpha = e.alpha
    if (e.beta != null) orientation.beta = e.beta
    if (e.gamma != null) orientation.gamma = e.gamma
    if (e.timeStamp != null) orientation.timeStamp = e.timeStamp
  }

  $effect(() => {
    if (motionControl === 'gyro') {
      joystickPosition = joystick.normalizeJoystickRelativePosition({
        x: orientationAngles.x / gyroMaxTiltAngle,
        y: -orientationAngles.y / gyroMaxTiltAngle,
      })
    }
  })

  // -------------------- motionControl === 'keyboard' --------------------

  let isKeyPressed: {
    w: boolean
    a: boolean
    s: boolean
    d: boolean
    arrowUp: boolean
    arrowDown: boolean
    arrowLeft: boolean
    arrowRight: boolean
  } = $state({
    w: false,
    a: false,
    s: false,
    d: false,
    arrowUp: false,
    arrowDown: false,
    arrowLeft: false,
    arrowRight: false,
  })

  const directions: {
    up: boolean
    down: boolean
    left: boolean
    right: boolean
  } = $derived({
    up: isKeyPressed.w || isKeyPressed.arrowUp,
    down: isKeyPressed.s || isKeyPressed.arrowDown,
    left: isKeyPressed.a || isKeyPressed.arrowLeft,
    right: isKeyPressed.d || isKeyPressed.arrowRight,
  })

  const keyboardControlRelativeSpeed: { x: number; y: number } = $derived({
    x: (directions.right ? 1 : 0) - (directions.left ? 1 : 0),
    y: (directions.up ? 1 : 0) - (directions.down ? 1 : 0),
  })

  const setKeyTo = (key: string, value: boolean) => {
    switch (key) {
      case 'w':
        isKeyPressed.w = value
        break
      case 'a':
        isKeyPressed.a = value
        break
      case 's':
        isKeyPressed.s = value
        break
      case 'd':
        isKeyPressed.d = value
        break
      case 'ArrowUp':
        isKeyPressed.arrowUp = value
        break
      case 'ArrowDown':
        isKeyPressed.arrowDown = value
        break
      case 'ArrowLeft':
        isKeyPressed.arrowLeft = value
        break
      case 'ArrowRight':
        isKeyPressed.arrowRight = value
        break
    }
  }

  $effect(() => {
    if (motionControl === 'keyboard') {
      joystickPosition = joystick.normalizeJoystickRelativePosition({
        x: keyboardControlRelativeSpeed.x,
        y: -keyboardControlRelativeSpeed.y,
      })
    }
  })

  // -------------------- headingControl --------------------

  const heading: number = $derived(headingControl === 'gyro' ? orientationAngles.z : 0)
  let isHeadingLocked: boolean = $state(false)

  // -------------------- Bluetooth --------------------

  let serviceUUID16: string = $state('FFF0')
  let rxUUID16: string = $state('FFF2')
  let txUUID16: string = $state('FFF1')

  let bluetooth: BluetoothConnectPanel | undefined = $state(undefined)

  let interval: ReturnType<typeof setInterval> | undefined = $state(undefined)

  let formattedString: string = $state('')

  const sendPacket = () => {
    bluetooth?.send(formattedString)
  }
</script>

<svelte:document
  onkeydown={(e: KeyboardEvent) => setKeyTo(e.key, true)}
  onkeyup={(e: KeyboardEvent) => setKeyTo(e.key, false)}
/>

<div class="flex w-full flex-col gap-2 p-4 md:gap-4 md:p-8">
  <h1 class="hidden text-center text-2xl md:block">Welcome to Soccer BT Remote</h1>

  <BluetoothConnectPanel
    bind:serviceUUID16
    bind:rxUUID16
    bind:txUUID16
    onConnected={() => {
      if (interval) clearInterval(interval)
      interval = setInterval(sendPacket, sendIntervalMs)
    }}
    onDisconnected={() => {
      if (interval) clearInterval(interval)
      interval = undefined
      addAlert('Disconnected', 'Disconnected from bluetooth device', 'info')
    }}
    onError={(e) => {
      addAlert(e.name, e.message, 'error')
    }}
    bind:this={bluetooth}
  />

  {#if isGyroRequired}
    <div class="flex flex-col justify-between gap-2 sm:flex-row sm:gap-0">
      <button
        class="btn btn-sm btn-primary md:btn-md"
        onclick={() => requestListenToOrientation(handleOrientation)}>Start Sensor Capture</button
      >

      {#if headingControl !== null}
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            class="checkbox checkbox-md checkbox-primary sm:checkbox-lg"
            bind:checked={isHeadingLocked}
          />
          Lock Heading
        </label>
      {/if}
    </div>
  {/if}

  <div class="align-center flex justify-between md:justify-center">
    <Joystick
      bind:position={joystickPosition}
      listenToMouse={motionControl === 'joystick'}
      listenToTouch={motionControl === 'joystick'}
      bind:this={joystick}
    />
  </div>

  <div class="flex flex-col gap-3">
    {#if isGyroRequired}
      <div class="grid grid-cols-1 gap-2 sm:grid-flow-col sm:grid-cols-4 sm:gap-6">
        <div class="text-xs">alpha: {orientation.alpha.toFixed(angleFix)}</div>
        <div class="text-xs">beta: {orientation.beta.toFixed(angleFix)}</div>
        <div class="text-xs">gamma: {orientation.gamma.toFixed(angleFix)}</div>
        <div class="text-xs">timeStamp: {Math.round(orientation.timeStamp)}</div>
      </div>
      <div class="grid grid-cols-1 gap-2 sm:grid-flow-col sm:grid-cols-3 sm:gap-6">
        <div class="text-md">angleX: {orientationAngles.x.toFixed(angleFix)}</div>
        <div class="text-md">angleY: {orientationAngles.y.toFixed(angleFix)}</div>
        <div class="text-md">angleZ: {orientationAngles.z.toFixed(angleFix)}</div>
      </div>
    {/if}
    <Serializer
      {motionAngle}
      {motionSpeed}
      {heading}
      {isHeadingLocked}
      updateFormattedString={(s) => (formattedString = s)}
    />
    <div class="text-md">packetFormat: {formattedString}</div>
  </div>
</div>
