<!--
PC demo page with WASD control.
-->
<script lang="ts">
  import Serializer from '$lib/components/serializer/Serializer.svelte'
  import BluetoothConnectPanel from '$lib/components/bluetooth/BluetoothConnectPanel.svelte'
  import { addAlert } from '$lib/alerts/alertStore.svelte'
  import { onMount } from 'svelte'

  const ABS_MAX_SPEED: number = 255

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

  onMount(() => {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      setKeyTo(e.key, true)
    })
    document.addEventListener('keyup', (e: KeyboardEvent) => {
      setKeyTo(e.key, false)
    })
  })

  let speedX = $derived(toLeft && toRight ? 0 : toRight ? 1 : toLeft ? -1 : 0)
  let speedY = $derived(toUp && toDown ? 0 : toUp ? 1 : toDown ? -1 : 0)

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
