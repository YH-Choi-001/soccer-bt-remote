<!--
Floating button that turns the rotated landscape mode on and off.
Only shown on touch devices in portrait, which is where the mode applies.
-->

<script lang="ts">
  import { landscapeRotation } from '$lib/rotation/landscapeRotation.svelte'
  import { addAlert } from '$lib/alerts/alertStore.svelte'

  const label: string = $derived(
    landscapeRotation.active ? 'Back to portrait' : 'Landscape (rotation lock on)'
  )

  function toggle() {
    const enable = !landscapeRotation.enabled
    landscapeRotation.setEnabled(enable)
    if (enable) {
      addAlert(
        'Landscape mode',
        'Keep rotation lock on and hold your phone with the charging port on the right.',
        'info'
      )
    }
  }
</script>

<button
  class="btn fixed right-3 bottom-3 z-50 hidden gap-1 opacity-80 btn-sm btn-neutral portrait:pointer-coarse:inline-flex"
  onclick={toggle}
  aria-label={label}
  title={label}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="size-4"
    aria-hidden="true"
  >
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 4v4h-4" />
  </svg>
  {landscapeRotation.active ? 'Portrait' : 'Landscape'}
</button>
