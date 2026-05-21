<script lang="ts">
  let {
    motionAngle,
    motionSpeed,
    heading,
    isHeadingLocked,
    updateFormattedString,
  }: {
    motionAngle: number
    motionSpeed: number
    heading: number
    isHeadingLocked?: boolean
    updateFormattedString?: (formatted: string) => void
  } = $props()

  let headingUsed: number = $state(0)
  $effect(() => {
    if (!isHeadingLocked) {
      headingUsed = heading
    }
  })

  const motionAngleNormalized: string = $derived(normalizeNumber(normalizeAngle(motionAngle)))
  const motionSpeedNormalized: string = $derived(normalizeNumber(motionSpeed))
  const headingNormalized: string = $derived(normalizeNumber(normalizeAngle(headingUsed)))
  const rawFormatted: string = $derived(
    `A${motionAngleNormalized}S${motionSpeedNormalized}H${headingNormalized}E\n`
  )
  $effect(() => {
    if (updateFormattedString) {
      updateFormattedString(rawFormatted)
    }
  })

  function normalizeAngle(value: number): number {
    while (value < 0) {
      value += 360
    }
    return value % 360
  }

  function normalizeNumber(value: number): string {
    return value.toFixed(0).padStart(3, '0')
  }
</script>

<div class="grid grid-cols-1 gap-2 sm:grid-flow-col sm:grid-cols-3 sm:gap-6">
  <div class="text-2xl">motionAngle: {motionAngleNormalized}</div>
  <div class="text-2xl">motionSpeed: {motionSpeedNormalized}</div>
  <div class="text-2xl">heading: {headingNormalized}</div>
</div>
