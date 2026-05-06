<!--
Home page.
-->

<script lang="ts">
	import { onMount } from "svelte";

  function attachEventHandlers() {
      window.addEventListener("devicemotion", handleMotion);
      window.addEventListener("deviceorientation", handleOrientation);
  }

  function handleClick() {
    if ('requestPermission' in DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === "function") {
      // The API requires permission — request it
      Promise.all([
        DeviceMotionEvent.requestPermission(),
        DeviceOrientationEvent.requestPermission(),
      ]).then(([motionPermission, orientationPermission]) => {
        if (
          motionPermission === "granted" &&
          orientationPermission === "granted"
        ) {
          attachEventHandlers();
        }
      });
    } else {
      attachEventHandlers();
    }
  }

  function handleMotion(e: DeviceMotionEvent) {
    const acceleration = e.accelerationIncludingGravity;
    console.log(acceleration?.x, acceleration?.y, acceleration?.z);
  }

  let alpha = $state(0);
  let beta = $state(0);
  let gamma = $state(0);
  let timestamp = $state(0);

  function handleOrientation(e: DeviceOrientationEvent) {
    if (e.alpha != null) alpha = e.alpha;
    if (e.beta != null) beta = e.beta;
    if (e.gamma != null) gamma = e.gamma;
    if (e.timeStamp != null) timestamp = e.timeStamp;
    console.log(e.alpha, e.beta, e.gamma, e.timeStamp);
  }

  onMount(() => {
    // On non-iOS devices (no requestPermission API), attach handlers immediately.
    // On iOS, the user must tap the Start button to trigger the permission prompt.
    if (!('requestPermission' in DeviceMotionEvent)) {
      attachEventHandlers();
    }
  });
</script>

<div class="w-full p-4">
  <h1 class="text-2xl text-center mb-6">Welcome to Soccer BT Remote</h1>
  <button
    class="text-2xl p-6 bg-blue-500 rounded-2xl w-full"
    onclick={handleClick}
  >CLICK ME TO START SENSOR CAPTURE</button
  >

  <div class="mt-6">
    <div class="text-2xl">alpha: {alpha}</div>
    <div class="text-2xl">beta: {beta}</div>
    <div class="text-2xl">gamma: {gamma}</div>
    <div class="text-2xl">timestamp: {timestamp}</div>
  </div>
</div>
