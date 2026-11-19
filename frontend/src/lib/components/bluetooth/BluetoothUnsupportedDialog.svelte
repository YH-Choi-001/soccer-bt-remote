<script lang="ts">
  import { resolve } from '$app/paths'
  import NoButtonModalDialog from '$lib/components/ui/NoButtonModalDialog.svelte'
  import { BluetoothFacade } from '$lib/bluetooth/BluetoothFacade.svelte'
  import { SerialFacade } from '$lib/bluetooth/SerialFacade.svelte'
  import type { BluetoothMode } from '$lib/bluetooth/BluetoothLink'

  let {
    mode = 'ble',
    isOpen = $bindable(!isModeSupported(mode)),
  }: {
    mode?: BluetoothMode
    isOpen?: boolean
  } = $props()

  function isModeSupported(m: BluetoothMode): boolean {
    return m === 'ble' ? BluetoothFacade.isSupported() : SerialFacade.isSupported()
  }

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
  const isAndroid = /Android/i.test(navigator.userAgent)
</script>

<NoButtonModalDialog bind:isOpen>
  {#if mode === 'ble'}
    <h3 class="text-lg font-bold">Your browser does not support Bluetooth Low Energy (BLE).</h3>
    <p class="py-4">
      Please use
      {#if isIOS}
        <a class="link link-info" href="https://bluefy.app/" target="_blank">Bluefy</a>
      {:else if isAndroid}
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
  {:else}
    <h3 class="text-lg font-bold">Your browser does not support Bluetooth Classic.</h3>
    <p class="py-4">
      {#if isIOS}
        iPhone and iPad browsers cannot connect to Bluetooth Classic devices. Please use a BLE robot
        with
        <a class="link link-info" href="https://bluefy.app/" target="_blank">Bluefy</a>
        instead.
      {:else if isAndroid}
        Please use the latest
        <a class="link link-info" href="https://www.google.com/chrome/" target="_blank">Chrome</a>
        to continue.
      {:else}
        Please use the latest
        <a class="link link-info" href="https://www.google.com/chrome/" target="_blank">Chrome</a>,
        <a class="link link-info" href="https://www.microsoft.com/edge" target="_blank">Edge</a>, or
        <a class="link link-info" href="https://www.opera.com/" target="_blank">Opera</a>
        to continue.
      {/if}
    </p>
    <p>
      See the
      <a class="link link-info" href={resolve('/bluetooth-classic')}
        >Bluetooth Classic setup guide</a
      > for details.
    </p>
  {/if}
</NoButtonModalDialog>
