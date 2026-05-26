<script lang="ts">
  import NoButtonModalDialog from '$lib/components/ui/NoButtonModalDialog.svelte'
  import { BluetoothFacade } from '$lib/bluetooth/BluetoothFacade.svelte'

  let {
    isOpen = $bindable(!BluetoothFacade.isSupported()),
  }: {
    isOpen?: boolean
  } = $props()
</script>

<NoButtonModalDialog bind:isOpen>
  <h3 class="text-lg font-bold">Your browser does not support Bluetooth.</h3>
  <p class="py-4">
    Please use
    {#if navigator.userAgent.match(/iPhone|iPad|iPod/i)}
      <a class="link link-info" href="https://bluefy.app/" target="_blank">Bluefy</a>
    {:else if navigator.userAgent.match(/Android/i)}
      <a class="link link-info" href="https://www.google.com/chrome/" target="_blank">Chrome</a>,
      <a class="link link-info" href="https://www.opera.com/" target="_blank">Opera</a>, or
      <a class="link link-info" href="https://www.samsung.com/internet/" target="_blank"
        >Samsung Internet</a
      >
    {:else}
      <a class="link link-info" href="https://www.google.com/chrome/" target="_blank">Chrome</a>,
      <a class="link link-info" href="https://www.microsoft.com/edge" target="_blank">Edge</a>, or
      <a class="link link-info" href="https://www.opera.com/" target="_blank">Opera</a>
    {/if}
    to continue.
  </p>
</NoButtonModalDialog>
