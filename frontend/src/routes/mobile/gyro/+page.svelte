<!--
Mobile demo page.
-->

<script lang="ts">
  import { requestListenToOrientation } from '$lib/orientation/orientation'
  import Serializer from '$lib/components/serializer/Serializer.svelte'
  import BluetoothConnectPanel from '$lib/components/bluetooth/BluetoothConnectPanel.svelte'
  import { addAlert } from '$lib/alerts/alertStore.svelte'

  const MAX_TILT_ANGLE: number = 45
  const ABS_MAX_SPEED: number = 255
  const ANGLE_FIX: number = 2

  let isHeadingLocked: boolean = $state(false)

  let alpha: number = $state(0)
  let beta: number = $state(0)
  let gamma: number = $state(0)
  let timeStamp: number = $state(0)

  function clamp(value: number, absMax: number): number {
    if (value < -absMax) return -absMax
    if (value > absMax) return absMax
    return value
  }

  function scale(value: number, originAbsMax: number, targetAbsMax: number): number {
    return (value / originAbsMax) * targetAbsMax
  }

  const angleX: number = $derived(beta)
  const angleY: number = $derived(gamma)
  const angleZ: number = $derived(-alpha)

  const motionAngle: number = $derived((Math.atan2(angleX, angleY) * 180) / Math.PI)
  const motionSpeed: number = $derived(
    clamp(
      scale(Math.sqrt(angleX * angleX + angleY * angleY), MAX_TILT_ANGLE, ABS_MAX_SPEED),
      ABS_MAX_SPEED
    )
  )
  const heading: number = $derived(angleZ)

  let formattedString: string = $state('')

  function handleOrientation(e: DeviceOrientationEvent): void {
    if (e.alpha != null) alpha = e.alpha
    if (e.beta != null) beta = e.beta
    if (e.gamma != null) gamma = e.gamma
    if (e.timeStamp != null) timeStamp = e.timeStamp
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

  <div class="flex flex-col justify-between gap-2 sm:flex-row sm:gap-0 sm:px-10">
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

  <div class="flex flex-col gap-3">
    <div class="grid grid-cols-1 gap-2 sm:grid-flow-col sm:grid-cols-4 sm:gap-6">
      <div class="text-xs">alpha: {alpha.toFixed(ANGLE_FIX)}</div>
      <div class="text-xs">beta: {beta.toFixed(ANGLE_FIX)}</div>
      <div class="text-xs">gamma: {gamma.toFixed(ANGLE_FIX)}</div>
      <div class="text-xs">timeStamp: {Math.round(timeStamp)}</div>
    </div>
    <div class="grid grid-cols-1 gap-2 sm:grid-flow-col sm:grid-cols-3 sm:gap-6">
      <div class="text-md">angleX: {angleX.toFixed(ANGLE_FIX)}</div>
      <div class="text-md">angleY: {angleY.toFixed(ANGLE_FIX)}</div>
      <div class="text-md">angleZ: {angleZ.toFixed(ANGLE_FIX)}</div>
    </div>
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
