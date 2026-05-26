<script lang="ts">
  import { alerts, removeAlert } from '$lib/alerts/alertStore.svelte'
  import { fly } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import Alert from '$lib/components/ui/Alert.svelte'
</script>

<!-- 
  'toast' is a DaisyUI class that handles stacking.
  'toast-top' and 'toast-center' handle positioning.
-->
<div class="toast toast-center toast-top z-[100] w-full max-w-xl p-4">
  {#each $alerts as alert (alert.id)}
    <div animate:flip={{ duration: 300 }}>
      <div in:fly={{ y: -50, duration: 400 }} out:fly={{ y: -50, duration: 400 }}>
        <Alert variant={alert.type} classes="alert-soft shadow-lg mb-2">
          <div class="flex flex-col items-start gap-2 md:flex-row md:items-center">
            {#if alert.title}
              <h3>{alert.title}</h3>
            {/if}
            {#if alert.message}
              <div>{alert.message}</div>
            {/if}
          </div>
          <button class="btn btn-ghost btn-xs" onclick={() => removeAlert(alert.id)}> ✕ </button>
        </Alert>
      </div>
    </div>
  {/each}
</div>

<style>
  /* Ensure the toast doesn't block clicks to elements behind it, 
     but the alerts themselves ARE clickable */
  .toast {
    pointer-events: none;
  }
</style>
