<!--
Mobile demo page with joystick.
-->
<script lang="ts">
  import { requestListenToOrientation } from '$lib/orientation/orientation'
  import Serializer from '$lib/components/serializer/Serializer.svelte'
  import BluetoothConnectPanel from '$lib/components/bluetooth/BluetoothConnectPanel.svelte'
  import { addAlert } from '$lib/alerts/alertStore.svelte'
  import Joystick from '$lib/components/ui/Joystick.svelte'

  const ABS_MAX_SPEED: number = 255

  let joystickX = $state(0)
  let joystickY = $state(0)

  let speedX = $derived(joystickX)
  let speedY = $derived(-joystickY)

  let isHeadingLocked: boolean = $state(false)

  let alpha: number = $state(0)
  const angleZ: number = $derived(-alpha)

  function clamp(value: number, absMax: number): number {
    if (value < -absMax) return -absMax
    if (value > absMax) return absMax
    return value
  }

  function scale(value: number, originAbsMax: number, targetAbsMax: number): number {
    return (value / originAbsMax) * targetAbsMax
  }

  const motionAngle: number = $derived((Math.atan2(speedX, speedY) * 180) / Math.PI)
  const motionSpeed: number = $derived(
    clamp(scale(Math.sqrt(speedX * speedX + speedY * speedY), 1, ABS_MAX_SPEED), ABS_MAX_SPEED)
  )

  const heading = $derived(angleZ)

  let formattedString: string = $state('')

  function handleOrientation(e: DeviceOrientationEvent): void {
    if (e.alpha != null) alpha = e.alpha
  }

  const SEND_INTERVAL_MS: number = 100

  let serviceUUID16: string = $state('FFF0')
  let rxUUID16: string = $state('FFF2')
  let txUUID16: string = $state('FFF1')

  let bluetooth: BluetoothConnectPanel | undefined = $state(undefined)

  let interval: ReturnType<typeof setInterval> | undefined = $state(undefined)

  const sendPacket = () => {
    bluetooth?.send(formattedString)
  }
</script>

<div class="flex w-full flex-col gap-2 p-4 md:gap-4 md:p-8">
  <h1 class="hidden text-center text-2xl md:block">Welcome to Soccer BT Remote</h1>

  <BluetoothConnectPanel
    bind:serviceUUID16
    bind:rxUUID16
    bind:txUUID16
    onConnected={() => {
      if (interval) clearInterval(interval)
      interval = setInterval(sendPacket, SEND_INTERVAL_MS)
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

  <div class="flex flex-col justify-between gap-2 sm:flex-row sm:gap-0">
    <button
      class="btn btn-primary"
      onclick={() => {
        requestListenToOrientation(handleOrientation)
      }}>Start Sensor Capture</button
    >

    <label class="flex items-center gap-2">
      <input
        type="checkbox"
        class="checkbox checkbox-lg checkbox-primary"
        bind:checked={isHeadingLocked}
      />
      Lock Heading
    </label>
  </div>

  <div class="align-center flex justify-center">
    <Joystick bind:x={joystickX} bind:y={joystickY} />
  </div>

  <div class="flex flex-col gap-3">
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
