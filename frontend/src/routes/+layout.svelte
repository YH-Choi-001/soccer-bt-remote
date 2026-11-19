<script lang="ts">
  import './layout.css'
  import favicon from '$lib/assets/favicon.svg'
  import AlertStack from '$lib/components/ui/AlertStack.svelte'
  import LandscapeToggle from '$lib/components/ui/LandscapeToggle.svelte'
  import { landscapeRotation } from '$lib/rotation/landscapeRotation.svelte'

  let { children } = $props()

  $effect(() => landscapeRotation.init())

  $effect(() => {
    document.documentElement.classList.toggle('rotated-landscape', landscapeRotation.active)
  })
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<!-- When rotated, .app-viewport is the rotated "screen" and .app-scroll scrolls inside it. -->
<div class="app-viewport">
  <AlertStack />
  <div class="app-scroll">
    {@render children()}
  </div>
  <LandscapeToggle />
</div>
