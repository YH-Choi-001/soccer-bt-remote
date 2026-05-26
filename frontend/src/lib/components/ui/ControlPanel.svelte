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

  let alpha: number = $state(0)
  let beta: number = $state(0)
  let gamma: number = $state(0)
  let timeStamp: number = $state(0)

  const angleX: number = $derived(beta)
  const angleY: number = $derived(gamma)
  const angleZ: number = $derived(-alpha)

  const handleOrientation = (e: DeviceOrientationEvent) => {
    if (e.alpha != null) alpha = e.alpha
    if (e.beta != null) beta = e.beta
    if (e.gamma != null) gamma = e.gamma
    if (e.timeStamp != null) timeStamp = e.timeStamp
  }

  $effect(() => {
    if (motionControl === 'gyro') {
      joystickPosition = joystick.normalizeJoystickRelativePosition({
        x: angleX / gyroMaxTiltAngle,
        y: -angleY / gyroMaxTiltAngle,
      })
    }
  })

  // -------------------- motionControl === 'keyboard' --------------------

  let w: boolean = $state(false)
  let a: boolean = $state(false)
  let s: boolean = $state(false)
  let d: boolean = $state(false)

  let arrowUp: boolean = $state(false)
  let arrowDown: boolean = $state(false)
  let arrowLeft: boolean = $state(false)
  let arrowRight: boolean = $state(false)

  let toUp = $derived(w || arrowUp)
  let toDown = $derived(s || arrowDown)
  let toLeft = $derived(a || arrowLeft)
  let toRight = $derived(d || arrowRight)

  const setKeyTo = (key: string, value: boolean) => {
    switch (key) {
      case 'w':
        w = value
        break
      case 'a':
        a = value
        break
      case 's':
        s = value
        break
      case 'd':
        d = value
        break
      case 'ArrowUp':
        arrowUp = value
        break
      case 'ArrowDown':
        arrowDown = value
        break
      case 'ArrowLeft':
        arrowLeft = value
        break
      case 'ArrowRight':
        arrowRight = value
        break
    }
  }

  $effect(() => {
    if (motionControl === 'keyboard') {
      joystickPosition = joystick.normalizeJoystickRelativePosition({
        x: toLeft && toRight ? 0 : toRight ? 1 : toLeft ? -1 : 0,
        y: -(toUp && toDown ? 0 : toUp ? 1 : toDown ? -1 : 0),
      })
    }
  })

  // -------------------- headingControl --------------------

  const heading: number = $derived(headingControl === 'gyro' ? angleZ : 0)
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
        <div class="text-xs">alpha: {alpha.toFixed(angleFix)}</div>
        <div class="text-xs">beta: {beta.toFixed(angleFix)}</div>
        <div class="text-xs">gamma: {gamma.toFixed(angleFix)}</div>
        <div class="text-xs">timeStamp: {Math.round(timeStamp)}</div>
      </div>
      <div class="grid grid-cols-1 gap-2 sm:grid-flow-col sm:grid-cols-3 sm:gap-6">
        <div class="text-md">angleX: {angleX.toFixed(angleFix)}</div>
        <div class="text-md">angleY: {angleY.toFixed(angleFix)}</div>
        <div class="text-md">angleZ: {angleZ.toFixed(angleFix)}</div>
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
