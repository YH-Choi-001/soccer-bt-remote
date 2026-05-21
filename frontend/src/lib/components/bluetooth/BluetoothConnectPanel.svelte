<script lang="ts">
  import BluetoothUnsupportedDialog from './BluetoothUnsupportedDialog.svelte'
  import { BluetoothFacade } from '$lib/bluetooth/BluetoothFacade.svelte'
  import InputUUID from '$lib/components/ui/InputUUID.svelte'

  let {
    serviceUUID16 = $bindable(),
    rxUUID16 = $bindable(),
    txUUID16 = $bindable(),
    onReceived = () => {},
    onConnected = () => {},
    onDisconnected = () => {},
    onError = () => {},
  }: {
    serviceUUID16: string
    rxUUID16: string
    txUUID16: string
    onReceived?: (text: string) => void
    onConnected?: () => void
    onDisconnected?: () => void
    onError?: (e: Error) => void
  } = $props()

  const serviceUUID = $derived(BluetoothFacade.uuid16To128(serviceUUID16))
  const rxUUID = $derived(BluetoothFacade.uuid16To128(rxUUID16))
  const txUUID = $derived(BluetoothFacade.uuid16To128(txUUID16))

  const scanOptions: RequestDeviceOptions = $derived({
    filters: [
      { namePrefix: 'JM9' },
      { namePrefix: 'XRCU' },
      { namePrefix: 'CSW' },
      { namePrefix: 'CSWCSS' },
      { namePrefix: 'REC' },
      { namePrefix: 'CSWREC' },
    ],
    optionalServices: [serviceUUID],
  })

  let device = $state<BluetoothFacade | null>(null)
  const isConnecting = $derived(device?.isConnecting ?? false)
  const isConnected = $derived(device?.isConnected ?? false)

  const statusBadgeClass = $derived(
    isConnecting ? 'badge-warning' : isConnected ? 'badge-success' : 'badge-ghost border-base-300'
  )

  function addLog(level: string, text: string) {
    console.log(`${level}: ${text}`)
  }

  function handleError(e: unknown) {
    onError(e instanceof Error ? e : new Error(String(e)))
  }

  // ── BLE logic ─────────────────────────────────────────────────────────────
  async function startScan() {
    try {
      addLog('system', 'Scanning for devices…')
      device = await BluetoothFacade.scan(serviceUUID, scanOptions)
      device.onReceived = internalOnReceived
      device.onDisconnected = internalOnDisconnected
      addLog('system', `Device selected: ${device.getDevice()?.name}`)
      await connect()
    } catch (e: unknown) {
      addLog('error', `Scan failed: ${e}`)
    }
  }

  async function connect() {
    try {
      addLog('system', 'Connecting to GATT server…')
      await device?.connect(rxUUID, txUUID)
      addLog('system', 'Ready — notifications active.')
      onConnected()
    } catch (e: unknown) {
      addLog('error', `Connection failed: ${e}`)
      handleError(e)
    }
  }

  async function disconnect() {
    await device?.disconnect()
  }

  const internalOnReceived = (text: string) => {
    const line = text.replace(/\r?\n$/, '')
    addLog('rx', line)
    onReceived(line)
  }

  const internalOnDisconnected = () => {
    addLog('system', 'Device disconnected unexpectedly.')
    onDisconnected()
  }

  export async function send(text: string) {
    try {
      await device?.send(text)
      addLog('tx', text + '\n')
    } catch (e: unknown) {
      addLog('error', `Send failed: ${e}`)
    }
  }
</script>

<BluetoothUnsupportedDialog />

<div class="flex flex-col gap-4">
  <div class="badge gap-2 badge-lg {statusBadgeClass}">
    <span class="inline-block h-2 w-2 rounded-full bg-current" class:animate-pulse={isConnected}
    ></span>
    {#if isConnecting}
      Connecting…
    {:else if isConnected}
      {device?.getDevice()?.name ?? 'Connected'}
    {:else if device?.getDevice()}
      {device.getDevice()?.name} — Disconnected
    {:else}
      No device
    {/if}
  </div>

  <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
    {#if !device?.getDevice() || !isConnected}
      <button class="btn btn-primary" onclick={startScan} disabled={isConnecting}>
        {#if isConnecting}
          <span class="loading loading-xs loading-spinner"></span> Connecting…
        {:else}
          🔍 Scan &amp; Connect
        {/if}
      </button>
    {:else}
      <button class="btn btn-outline btn-sm btn-error" onclick={disconnect}> ✕ Disconnect </button>
    {/if}

    <div class="flex flex-wrap items-center gap-3 md:gap-6">
      <!-- service UUID -->
      <InputUUID
        labelText="Service"
        bind:uuid16={serviceUUID16}
        disabled={isConnecting || isConnected}
      />

      <!-- rx UUID -->
      <InputUUID labelText="RX" bind:uuid16={rxUUID16} disabled={isConnecting || isConnected} />

      <!-- tx UUID -->
      <InputUUID labelText="TX" bind:uuid16={txUUID16} disabled={isConnecting || isConnected} />
    </div>
  </div>
</div>
