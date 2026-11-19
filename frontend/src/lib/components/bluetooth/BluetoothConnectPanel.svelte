<script lang="ts">
  import { resolve } from '$app/paths'
  import BluetoothUnsupportedDialog from './BluetoothUnsupportedDialog.svelte'
  import BluetoothModeSelector from './BluetoothModeSelector.svelte'
  import { BluetoothFacade } from '$lib/bluetooth/BluetoothFacade.svelte'
  import { SerialFacade, SPP_UUID16 } from '$lib/bluetooth/SerialFacade.svelte'
  import type { BluetoothLink, BluetoothMode } from '$lib/bluetooth/BluetoothLink'
  import InputUUID from '$lib/components/ui/InputUUID.svelte'

  let {
    serviceUUID16 = $bindable(),
    rxUUID16 = $bindable(),
    txUUID16 = $bindable(),
    classicServiceUUID16 = $bindable(SPP_UUID16),
    onReceived = () => {},
    onConnected = () => {},
    onDisconnected = () => {},
    onError = () => {},
  }: {
    serviceUUID16: string
    rxUUID16: string
    txUUID16: string
    classicServiceUUID16?: string
    onReceived?: (text: string) => void
    onConnected?: () => void
    onDisconnected?: () => void
    onError?: (e: Error) => void
  } = $props()

  const serviceUUID = $derived(BluetoothFacade.uuid16To128(serviceUUID16))
  const rxUUID = $derived(BluetoothFacade.uuid16To128(rxUUID16))
  const txUUID = $derived(BluetoothFacade.uuid16To128(txUUID16))
  const classicServiceUUID = $derived(BluetoothFacade.uuid16To128(classicServiceUUID16))

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

  const isSupported: Record<BluetoothMode, boolean> = {
    ble: BluetoothFacade.isSupported(),
    classic: SerialFacade.isSupported(),
  }
  // Prefer BLE; fall back to Classic when only Web Serial is available.
  const initialMode: BluetoothMode = !isSupported.ble && isSupported.classic ? 'classic' : 'ble'
  let mode: BluetoothMode = $state(initialMode)
  const isModeSupported = $derived(isSupported[mode])

  let device = $state<BluetoothLink | null>(null)
  const isConnecting = $derived(device?.isConnecting ?? false)
  const isConnected = $derived(device?.isConnected ?? false)
  const isUUIDEditable = $derived(isModeSupported && !isConnecting && !isConnected)

  const statusBadgeClass = $derived(
    isConnecting ? 'badge-warning' : isConnected ? 'badge-success' : 'badge-ghost border-base-300'
  )

  function addLog(level: string, text: string) {
    console.log(`${level}: ${text}`)
  }

  let isBluetoothUnsupportedDialogOpen = $state(!isSupported[initialMode])

  function changeMode(newMode: BluetoothMode) {
    mode = newMode
    device = null
    if (!isSupported[newMode]) isBluetoothUnsupportedDialogOpen = true
  }

  function handleError(e: unknown) {
    if (!isModeSupported) {
      isBluetoothUnsupportedDialogOpen = true
    } else {
      onError(e instanceof Error ? e : new Error(String(e)))
    }
  }

  // ── Connection logic ──────────────────────────────────────────────────────
  async function startScan() {
    try {
      addLog('system', 'Scanning for devices…')
      if (mode === 'ble') {
        const ble = await BluetoothFacade.scan(serviceUUID, scanOptions)
        device = attach(ble)
        await connect(() => ble.connect(rxUUID, txUUID))
      } else {
        const classic = await SerialFacade.request(classicServiceUUID)
        device = attach(classic)
        await connect(() => classic.connect())
      }
    } catch (e: unknown) {
      addLog('error', `Scan failed: ${e}`)
      handleError(e)
    }
  }

  function attach<T extends BluetoothLink>(link: T): T {
    link.onReceived = internalOnReceived
    link.onDisconnected = internalOnDisconnected
    addLog('system', `Device selected: ${link.getName()}`)
    return link
  }

  async function connect(open: () => Promise<void>) {
    try {
      addLog('system', 'Connecting…')
      await open()
      addLog('system', 'Ready.')
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
      handleError(e)
    }
  }
</script>

<BluetoothUnsupportedDialog {mode} bind:isOpen={isBluetoothUnsupportedDialogOpen} />

<div class="flex flex-col gap-2 sm:gap-4">
  <div class="flex flex-wrap items-center gap-2 sm:gap-4">
    <BluetoothModeSelector
      bind:mode={() => mode, changeMode}
      disabled={isConnecting || isConnected}
      classes="btn-xs sm:btn-sm md:btn-md"
    />

    <div class="badge gap-2 badge-sm sm:badge-md md:badge-lg {statusBadgeClass}">
      <span class="inline-block h-2 w-2 rounded-full bg-current" class:animate-pulse={isConnected}
      ></span>
      {#if isConnecting}
        Connecting…
      {:else if isConnected}
        {device?.getName() ?? 'Connected'}
      {:else if device}
        {device.getName()} — Disconnected
      {:else}
        No device
      {/if}
    </div>

    {#if mode === 'classic'}
      <a class="link text-sm link-info" href={resolve('/bluetooth-classic')}>Setup guide</a>
    {/if}
  </div>

  <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
    {#if !device || !isConnected}
      <button
        class="btn btn-sm btn-primary md:btn-md"
        onclick={startScan}
        disabled={!isModeSupported || isConnecting}
      >
        {#if isConnecting}
          <span class="loading loading-xs loading-spinner"></span> Connecting…
        {:else}
          🔍 Scan &amp; Connect
        {/if}
      </button>
    {:else}
      <button class="btn btn-outline btn-sm btn-error md:btn-md" onclick={disconnect}>
        ✕ Disconnect
      </button>
    {/if}

    <div class="flex flex-wrap items-center gap-3 md:gap-6">
      {#if mode === 'classic'}
        <!-- RFCOMM service class UUID (Serial Port Profile by default) -->
        <InputUUID
          labelText="Service"
          bind:uuid16={classicServiceUUID16}
          disabled={!isUUIDEditable}
          classes="input-xs sm:input-sm md:input-md"
        />
      {:else}
        <!-- service UUID -->
        <InputUUID
          labelText="Service"
          bind:uuid16={serviceUUID16}
          disabled={!isUUIDEditable}
          classes="input-xs sm:input-sm md:input-md"
        />

        <!-- rx UUID -->
        <InputUUID
          labelText="RX"
          bind:uuid16={rxUUID16}
          disabled={!isUUIDEditable}
          classes="input-xs sm:input-sm md:input-md"
        />

        <!-- tx UUID -->
        <InputUUID
          labelText="TX"
          bind:uuid16={txUUID16}
          disabled={!isUUIDEditable}
          classes="input-xs sm:input-sm md:input-md"
        />
      {/if}
    </div>
  </div>
</div>
