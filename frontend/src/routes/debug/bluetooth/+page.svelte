<!--
  Bluetooth debug page.
  Interactive terminal for 2-way BLE communication via Nordic UART Service (NUS).
-->

<script lang="ts">
  import { BluetoothFacade } from '$lib/bluetooth/BluetoothFacade.svelte'

  // ── Nordic UART Service (NUS) UUIDs ───────────────────────────────────────
  // These are the standard BLE UART profile UUIDs. Change if your device uses
  // a different custom UART service.
  const SERVICE_UUID_16 = 'fff0'
  const SERVICE_UUID = BluetoothFacade.uuid16To128(SERVICE_UUID_16)

  const scanOptions: RequestDeviceOptions = {
    filters: [
      { namePrefix: 'JM9' },
      { namePrefix: 'XRCU' },
      { namePrefix: 'CSW' },
      { namePrefix: 'CSWCSS' },
      { namePrefix: 'REC' },
      { namePrefix: 'CSWREC' },
    ],
    optionalServices: [SERVICE_UUID],
  }

  // ── Types ─────────────────────────────────────────────────────────────────
  type Direction = 'rx' | 'tx' | 'system' | 'error'
  type LogEntry = { id: number; time: string; dir: Direction; text: string }

  let device = $state<BluetoothFacade | null>(null)
  let isConnecting = $derived(device?.isConnecting ?? false)
  let isConnected = $derived(device?.isConnected ?? false)
  let log: LogEntry[] = $state([])
  let input = $state('')

  let logCounter = 0
  let terminalEl: HTMLDivElement

  // ── DaisyUI badge class for connection status ──────────────────────────────
  const statusBadgeClass = $derived(
    device == null
      ? 'badge-ghost border-base-300'
      : isConnecting
        ? 'badge-warning'
        : isConnected
          ? 'badge-success'
          : 'badge-ghost border-base-300'
  )

  // ── Direction helpers (replaces dynamic CSS classes) ──────────────────────
  function prefixClass(dir: Direction): string {
    switch (dir) {
      case 'rx':
        return 'text-success bg-success/15'
      case 'tx':
        return 'text-info bg-info/15'
      case 'system':
        return 'text-secondary bg-secondary/15'
      case 'error':
        return 'text-error bg-error/15'
    }
  }

  function msgClass(dir: Direction): string {
    switch (dir) {
      case 'rx':
        return 'text-success/80'
      case 'tx':
        return 'text-info/80'
      case 'system':
        return 'text-secondary/80'
      case 'error':
        return 'text-error/80'
    }
  }

  function dirLabel(dir: Direction): string {
    switch (dir) {
      case 'rx':
        return 'RX'
      case 'tx':
        return 'TX'
      case 'system':
        return 'SYS'
      case 'error':
        return 'ERR'
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function now() {
    return new Date().toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  function addLog(dir: Direction, text: string) {
    log = [...log, { id: logCounter++, time: now(), dir, text }]
    setTimeout(() => {
      terminalEl?.scrollTo({ top: terminalEl.scrollHeight, behavior: 'smooth' })
    }, 0)
  }

  // ── BLE logic ─────────────────────────────────────────────────────────────
  async function startScan() {
    try {
      addLog('system', 'Scanning for devices…')
      device = await BluetoothFacade.scan(SERVICE_UUID, scanOptions)
      device.onReceived = onReceive
      device.onDisconnected = onDisconnect
      addLog('system', `Device selected: ${device.getDevice()?.name}`)
      await connect()
    } catch (e) {
      addLog('error', `Scan failed: ${e}`)
    }
  }

  async function connect() {
    try {
      addLog('system', 'Connecting to GATT server…')
      await device?.connect()
      addLog('system', 'Ready — notifications active.')
    } catch (e) {
      addLog('error', `Connection failed: ${e}`)
    }
  }

  async function disconnect() {
    await device?.disconnect()
  }

  const onReceive = (text: string) => {
    const line = text.replace(/\r?\n$/, '')
    addLog('rx', line)
  }

  const onDisconnect = () => {
    addLog('system', 'Device disconnected unexpectedly.')
  }

  async function send() {
    const text = input.trim()
    if (!text) return
    try {
      await device?.send(text + '\n')
      addLog('tx', text)
      input = ''
    } catch (e) {
      addLog('error', `Send failed: ${e}`)
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }
</script>

<svelte:head>
  <title>BT Terminal | Debug</title>
</svelte:head>

<!-- data-theme="night" scopes the DaisyUI dark terminal theme to this page -->
<div
  class="mx-auto box-border flex h-dvh max-w-3xl flex-col gap-3 px-4"
  style="font-family: 'JetBrains Mono', 'Fira Code', monospace;"
  data-theme="night"
>
  <!-- ── Header ─────────────────────────────────────────────────────────── -->
  <header class="flex items-center justify-between border-b border-base-300 py-4">
    <div class="flex items-center gap-2">
      <span class="text-2xl text-primary">⬡</span>
      <h1 class="m-0 text-sm font-semibold tracking-widest text-base-content uppercase">
        BLE Terminal
      </h1>
    </div>

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
  </header>

  <!-- ── Controls ───────────────────────────────────────────────────────── -->
  <div class="flex flex-wrap gap-2">
    {#if !device?.getDevice() || !isConnected}
      <button class="btn btn-sm btn-primary" onclick={startScan} disabled={isConnecting}>
        {#if isConnecting}
          <span class="loading loading-xs loading-spinner"></span> Connecting…
        {:else}
          🔍 Scan &amp; Connect
        {/if}
      </button>
    {:else}
      <button
        class="btn btn-outline btn-sm btn-success"
        onclick={connect}
        disabled={isConnecting || isConnected}
      >
        ⚡ Reconnect
      </button>
      <button class="btn btn-outline btn-sm btn-error" onclick={disconnect}> ✕ Disconnect </button>
    {/if}
    <button class="btn btn-ghost btn-sm" onclick={() => (log = [])}> 🗑 Clear </button>
  </div>

  <!-- ── Terminal ────────────────────────────────────────────────────────── -->
  <div
    class="flex flex-1 flex-col gap-0.5 overflow-y-auto scroll-smooth rounded-xl border border-base-300 bg-base-300 p-4 text-xs leading-relaxed"
    bind:this={terminalEl}
  >
    {#if log.length === 0}
      <div class="m-auto text-center text-sm text-base-content/25 select-none">
        Connect a device to start the session…
      </div>
    {/if}
    {#each log as entry (entry.id)}
      <div class="grid items-baseline gap-2" style="grid-template-columns: 5.5rem 3.2rem 1fr">
        <span class="text-[0.7rem] text-base-content/30 select-none">{entry.time}</span>
        <span
          class="rounded px-1 py-0.5 text-center text-[0.65rem] font-bold tracking-widest select-none {prefixClass(
            entry.dir
          )}"
        >
          {dirLabel(entry.dir)}
        </span>
        <span class="break-all whitespace-pre-wrap {msgClass(entry.dir)}">{entry.text}</span>
      </div>
    {/each}
  </div>

  <!-- ── Input ──────────────────────────────────────────────────────────── -->
  <div
    class="join mb-3 overflow-hidden rounded-xl border border-base-300 {!isConnected
      ? 'opacity-40'
      : ''}"
  >
    <span class="join-item flex items-center bg-base-300 px-3 text-primary select-none">&gt;</span>
    <input
      id="bt-terminal-input"
      type="text"
      class="input join-item flex-1 rounded-none border-none bg-base-300 text-sm focus:outline-none"
      placeholder={isConnected ? 'Type a command and press Enter…' : 'Not connected'}
      disabled={!isConnected}
      bind:value={input}
      onkeydown={onKeydown}
      autocomplete="off"
      spellcheck="false"
    />
    <button
      class="btn join-item rounded-none border-0 border-l border-base-300 px-4 btn-outline btn-sm btn-primary"
      onclick={send}
      disabled={!isConnected || !input.trim()}
    >
      Send
    </button>
  </div>
</div>
