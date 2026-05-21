<!--
Mobile demo page.
-->

<script lang="ts">
  import { requestListenToOrientation } from '$lib/orientation/orientation'

  const MAX_TILT_ANGLE: number = 45
  const ABS_MAX_SPEED: number = 255
  const ANGLE_FIX: number = 2

  let isHeadingLocked: boolean = $state(false)
  let lockedHeading: number = $state(0)

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

  function normalizeAngle(value: number): number {
    while (value < 0) {
      value += 360
    }
    return value % 360
  }

  function normalizeNumber(value: number): string {
    return value.toFixed(0).padStart(3, '0')
  }

  let angleX: number = $derived(beta)
  let angleY: number = $derived(gamma)
  let angleZ: number = $derived(normalizeAngle(-alpha))

  let motionAngle: number = $derived(normalizeAngle((Math.atan2(angleX, angleY) * 180) / Math.PI))
  let motionSpeed: number = $derived(
    clamp(
      scale(Math.sqrt(angleX * angleX + angleY * angleY), MAX_TILT_ANGLE, ABS_MAX_SPEED),
      ABS_MAX_SPEED
    )
  )
  let heading: number = $derived(isHeadingLocked ? lockedHeading : angleZ)

  let motionAngleNormalized: string = $derived(normalizeNumber(motionAngle))
  let motionSpeedNormalized: string = $derived(normalizeNumber(motionSpeed))
  let headingNormalized: string = $derived(normalizeNumber(heading))

  let packetFormat: string = $derived(
    `A${motionAngleNormalized}S${motionSpeedNormalized}H${headingNormalized}E`
  )

  function handleOrientation(e: DeviceOrientationEvent): void {
    if (e.alpha != null) alpha = e.alpha
    if (e.beta != null) beta = e.beta
    if (e.gamma != null) gamma = e.gamma
    if (e.timeStamp != null) timeStamp = e.timeStamp
  }
</script>

<div class="flex w-full flex-col gap-4 p-4">
  <h1 class="text-center text-2xl">Welcome to Soccer BT Remote</h1>

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
        onchange={() => (lockedHeading = angleZ)}
      />
      Lock Heading
    </label>
  </div>

  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-2 sm:flex-row sm:gap-6">
      <div class="text-xs">alpha: {alpha.toFixed(ANGLE_FIX)}</div>
      <div class="text-xs">beta: {beta.toFixed(ANGLE_FIX)}</div>
      <div class="text-xs">gamma: {gamma.toFixed(ANGLE_FIX)}</div>
      <div class="text-xs">timeStamp: {Math.round(timeStamp)}</div>
    </div>
    <div class="flex flex-col gap-2 sm:flex-row sm:gap-6">
      <div class="text-md">angleX: {angleX.toFixed(ANGLE_FIX)}</div>
      <div class="text-md">angleY: {angleY.toFixed(ANGLE_FIX)}</div>
    </div>
    <div class="flex flex-col gap-2 sm:flex-row sm:gap-6">
      <div class="text-2xl">motionAngle: {motionAngleNormalized}</div>
      <div class="text-2xl">motionSpeed: {motionSpeedNormalized}</div>
      <div class="text-2xl">heading: {headingNormalized}</div>
    </div>
    <div class="text-md">packetFormat: {packetFormat}</div>
  </div>
</div>
