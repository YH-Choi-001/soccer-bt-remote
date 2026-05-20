<!--
Mobile demo page.
-->

<script lang="ts">
  import { requestListenToOrientation } from '$lib/orientation/orientation'

  let alpha = $state(0)
  let beta = $state(0)
  let gamma = $state(0)
  let timeStamp = $state(0)

  function handleOrientation(e: DeviceOrientationEvent) {
    if (e.alpha != null) alpha = e.alpha
    if (e.beta != null) beta = e.beta
    if (e.gamma != null) gamma = e.gamma
    if (e.timeStamp != null) timeStamp = e.timeStamp
    console.log(e.alpha, e.beta, e.gamma, e.timeStamp)
  }
</script>

<div class="w-full p-4">
  <h1 class="mb-6 text-center text-2xl">Welcome to Soccer BT Remote</h1>
  <button
    class="w-full rounded-2xl bg-blue-500 p-6 text-2xl"
    onclick={() => {
      requestListenToOrientation(handleOrientation)
    }}>CLICK ME TO START SENSOR CAPTURE</button
  >

  <div class="mt-6">
    <div class="text-2xl">alpha: {alpha}</div>
    <div class="text-2xl">beta: {beta}</div>
    <div class="text-2xl">gamma: {gamma}</div>
    <div class="text-2xl">timeStamp: {timeStamp}</div>
  </div>
</div>
