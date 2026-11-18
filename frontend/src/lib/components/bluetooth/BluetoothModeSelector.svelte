<!--
Toggle between BLE (Web Bluetooth) and Bluetooth Classic (Web Serial).
-->

<script lang="ts">
  import type { BluetoothMode } from '$lib/bluetooth/BluetoothLink'

  let {
    mode = $bindable(),
    disabled = false,
    classes = '',
  }: {
    mode: BluetoothMode
    disabled?: boolean
    classes?: string
  } = $props()

  const uid = $props.id()
  const name = `bt-mode-${uid}`
</script>

<div class="join" role="radiogroup" aria-label="Bluetooth type">
  <input
    class="btn join-item {classes}"
    type="radio"
    {name}
    value="ble"
    aria-label="BLE"
    bind:group={mode}
    {disabled}
  />
  <input
    class="btn join-item {classes}"
    type="radio"
    {name}
    value="classic"
    aria-label="Classic"
    bind:group={mode}
    {disabled}
  />
</div>
