<!--
PC demo page with mouse control.
-->
<script lang="ts">
  import Serializer from '$lib/components/serializer/Serializer.svelte'
  import BluetoothConnectPanel from '$lib/components/bluetooth/BluetoothConnectPanel.svelte'
  import { addAlert } from '$lib/alerts/alertStore.svelte'
  import Joystick from '$lib/components/ui/Joystick.svelte'

  const ABS_MAX_SPEED: number = 255

  let joystickX = $state(0)
  let joystickY = $state(0)

  let speedX = $derived(joystickX)
  let speedY = $derived(-joystickY)

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

  const heading = 0

  let formattedString: string = $state('')

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

<div class="flex w-full flex-col gap-4 p-4">
  <h1 class="text-center text-2xl">Welcome to Soccer BT Remote</h1>

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

  <div class="align-center flex justify-center">
    <Joystick bind:x={joystickX} bind:y={joystickY} />
  </div>

  <div class="flex flex-col gap-3">
    <Serializer
      {motionAngle}
      {motionSpeed}
      {heading}
      isHeadingLocked={true}
      updateFormattedString={(s) => (formattedString = s)}
    />
    <div class="text-md">packetFormat: {formattedString}</div>
  </div>
</div>
