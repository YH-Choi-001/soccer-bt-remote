<!--
  Bluetooth debug page.
  Interactive terminal for 2-way BLE communication via Nordic UART Service (NUS).
-->

<script lang="ts">
  // ── Nordic UART Service (NUS) UUIDs ───────────────────────────────────────
  // These are the standard BLE UART profile UUIDs. Change if your device uses
  // a different custom UART service.
  const NUS_SERVICE  = '0000fff0-0000-1000-8000-00805f9b34fb';
  const NUS_RX_CHAR  = '0000fff2-0000-1000-8000-00805f9b34fb'; // phone → device
  const NUS_TX_CHAR  = '0000fff1-0000-1000-8000-00805f9b34fb'; // device → phone

  const scanOptions: RequestDeviceOptions = {
    filters: [
      { namePrefix: 'JM9' },
      { namePrefix: 'XRCU' },
      { namePrefix: 'CSW' },
      { namePrefix: 'CSWCSS' },
      { namePrefix: 'REC' },
      { namePrefix: 'CSWREC' },
    ],
    optionalServices: [NUS_SERVICE],
  };

  // ── Types ─────────────────────────────────────────────────────────────────
  type Direction = 'rx' | 'tx' | 'system' | 'error';
  type LogEntry  = { id: number; time: string; dir: Direction; text: string };

  // ── State ─────────────────────────────────────────────────────────────────
  let device:     BluetoothDevice | null                      = $state(null);
  let server:     BluetoothRemoteGATTServer | null            = $state(null);
  let rxChar:     BluetoothRemoteGATTCharacteristic | null    = $state(null);
  let txChar:     BluetoothRemoteGATTCharacteristic | null    = $state(null);
  let log:        LogEntry[]                                  = $state([]);
  let input:      string                                      = $state('');
  let connecting: boolean                                     = $state(false);

  let logCounter  = 0;
  let terminalEl: HTMLDivElement;

  const isConnected = $derived(!!server?.connected);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function now() {
    return new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function addLog(dir: Direction, text: string) {
    log = [...log, { id: logCounter++, time: now(), dir, text }];
    setTimeout(() => { terminalEl?.scrollTo({ top: terminalEl.scrollHeight, behavior: 'smooth' }); }, 0);
  }

  // ── BLE logic ─────────────────────────────────────────────────────────────
  async function startScan() {
    try {
      addLog('system', 'Scanning for devices…');
      const d = await navigator.bluetooth.requestDevice(scanOptions);
      device = d;
      addLog('system', `Device selected: ${d.name}`);
      await connect();
    } catch (e) {
      addLog('error', `Scan failed: ${e}`);
    }
  }

  async function connect() {
    if (!device?.gatt) return;
    connecting = true;
    try {
      addLog('system', 'Connecting to GATT server…');
      server = await device.gatt.connect();
      addLog('system', 'GATT connected. Discovering NUS service…');

      const service = await server.getPrimaryService(NUS_SERVICE);
      rxChar = await service.getCharacteristic(NUS_RX_CHAR);
      txChar = await service.getCharacteristic(NUS_TX_CHAR);

      await txChar.startNotifications();
      txChar.addEventListener('characteristicvaluechanged', onReceive);
      device.addEventListener('gattserverdisconnected', onDisconnect);

      addLog('system', 'Ready — notifications active.');
    } catch (e) {
      addLog('error', `Connection failed: ${e}`);
      server = null;
    } finally {
      connecting = false;
    }
  }

  async function disconnect() {
    if (txChar) {
      txChar.removeEventListener('characteristicvaluechanged', onReceive);
      await txChar.stopNotifications().catch(() => {});
    }
    server?.disconnect();
    rxChar  = null;
    txChar  = null;
    server  = null;
    addLog('system', 'Disconnected.');
  }

  function onReceive(event: Event) {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    if (!value) return;
    const text = new TextDecoder('utf-8').decode(value).replace(/\r?\n$/, '');
    addLog('rx', text);
  }

  function onDisconnect() {
    addLog('system', 'Device disconnected unexpectedly.');
    server = null;
    rxChar = null;
    txChar = null;
  }

  // ── Sending ───────────────────────────────────────────────────────────────
  // BLE classic MTU is 20 bytes; chunk to be safe with older firmware.
  const MTU = 20;

  async function send() {
    const text = input.trim();
    if (!text || !rxChar) return;
    try {
      const bytes = new TextEncoder().encode(text + '\n');
      for (let i = 0; i < bytes.length; i += MTU) {
        await rxChar.writeValueWithResponse(bytes.slice(i, i + MTU));
      }
      addLog('tx', text);
      input = '';
    } catch (e) {
      addLog('error', `Send failed: ${e}`);
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }
</script>

<svelte:head>
  <title>BT Terminal | Debug</title>
</svelte:head>

<div class="page">
  <!-- ── Header ─────────────────────────────────────────────────────────── -->
  <header>
    <div class="header-left">
      <span class="logo">⬡</span>
      <h1>BLE Terminal</h1>
    </div>
    <div class="status-pill" class:connected={isConnected} class:connecting={connecting}>
      <span class="dot"></span>
      {#if connecting}
        Connecting…
      {:else if isConnected}
        {device?.name ?? 'Connected'}
      {:else if device}
        {device.name} — Disconnected
      {:else}
        No device
      {/if}
    </div>
  </header>

  <!-- ── Controls ───────────────────────────────────────────────────────── -->
  <div class="controls">
    {#if !device || !isConnected}
      <button class="btn btn-primary" onclick={startScan} disabled={connecting}>
        {#if connecting}⏳ Connecting…{:else}🔍 Scan &amp; Connect{/if}
      </button>
    {:else}
      <button class="btn btn-connect" onclick={connect} disabled={connecting || isConnected}>
        ⚡ Reconnect
      </button>
      <button class="btn btn-danger" onclick={disconnect}>
        ✕ Disconnect
      </button>
    {/if}
    <button class="btn btn-ghost" onclick={() => (log = [])}>
      🗑 Clear
    </button>
  </div>

  <!-- ── Terminal ────────────────────────────────────────────────────────── -->
  <div class="terminal" bind:this={terminalEl}>
    {#if log.length === 0}
      <div class="empty-state">Connect a device to start the session…</div>
    {/if}
    {#each log as entry (entry.id)}
      <div class="line line-{entry.dir}">
        <span class="ts">{entry.time}</span>
        <span class="prefix">
          {#if entry.dir === 'rx'}RX{:else if entry.dir === 'tx'}TX{:else if entry.dir === 'error'}ERR{:else}SYS{/if}
        </span>
        <span class="msg">{entry.text}</span>
      </div>
    {/each}
  </div>

  <!-- ── Input ──────────────────────────────────────────────────────────── -->
  <div class="input-bar" class:disabled={!isConnected}>
    <span class="prompt">&gt;</span>
    <input
      id="bt-terminal-input"
      type="text"
      placeholder={isConnected ? 'Type a command and press Enter…' : 'Not connected'}
      disabled={!isConnected}
      bind:value={input}
      onkeydown={onKeydown}
      autocomplete="off"
      spellcheck="false"
    />
    <button class="send-btn" onclick={send} disabled={!isConnected || !input.trim()}>Send</button>
  </div>
</div>

<style>
  :global(body) {
    background: #0d0f14;
    margin: 0;
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  }

  .page {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    max-width: 900px;
    margin: 0 auto;
    padding: 0 1rem;
    box-sizing: border-box;
    gap: 0.75rem;
  }

  /* ── Header ──────────────────────────────────────────────────────────── */
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0 0.5rem;
    border-bottom: 1px solid #1e2230;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .logo {
    font-size: 1.4rem;
    color: #4f8ef7;
  }

  h1 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .status-pill {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.78rem;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    background: #1a1d27;
    color: #64748b;
    border: 1px solid #2a2d3a;
    transition: all 0.3s;
  }

  .status-pill.connected {
    background: #0f2a1a;
    border-color: #22c55e40;
    color: #4ade80;
  }

  .status-pill.connecting {
    background: #1a1f0f;
    border-color: #facc1540;
    color: #facc15;
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
  }

  .status-pill.connected .dot {
    box-shadow: 0 0 6px #4ade80;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* ── Controls ─────────────────────────────────────────────────────────── */
  .controls {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .btn {
    padding: 0.45rem 1rem;
    border-radius: 8px;
    font-size: 0.82rem;
    font-family: inherit;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s;
  }

  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn-primary {
    background: #4f8ef7;
    color: #fff;
    border-color: #4f8ef7;
  }
  .btn-primary:not(:disabled):hover { background: #3b78e7; }

  .btn-connect {
    background: #1a2a1a;
    color: #4ade80;
    border-color: #22c55e40;
  }
  .btn-connect:not(:disabled):hover { background: #22c55e20; }

  .btn-danger {
    background: #2a1a1a;
    color: #f87171;
    border-color: #ef444440;
  }
  .btn-danger:not(:disabled):hover { background: #ef444420; }

  .btn-ghost {
    background: #1a1d27;
    color: #64748b;
    border-color: #2a2d3a;
  }
  .btn-ghost:hover { background: #22263a; color: #94a3b8; }

  /* ── Terminal ─────────────────────────────────────────────────────────── */
  .terminal {
    flex: 1;
    overflow-y: auto;
    background: #080a0f;
    border: 1px solid #1e2230;
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.82rem;
    line-height: 1.6;
    scroll-behavior: smooth;
  }

  .terminal::-webkit-scrollbar { width: 5px; }
  .terminal::-webkit-scrollbar-track { background: transparent; }
  .terminal::-webkit-scrollbar-thumb { background: #2a2d3a; border-radius: 4px; }

  .empty-state {
    margin: auto;
    color: #2a2d3a;
    font-size: 0.85rem;
    text-align: center;
  }

  .line {
    display: grid;
    grid-template-columns: 5.5rem 3.2rem 1fr;
    gap: 0.5rem;
    align-items: baseline;
    font-size: 0.8rem;
  }

  .ts {
    color: #2e3347;
    font-size: 0.72rem;
    user-select: none;
  }

  .prefix {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-align: center;
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
    user-select: none;
  }

  .msg {
    color: #cbd5e1;
    word-break: break-all;
    white-space: pre-wrap;
  }

  /* Direction colors */
  .line-rx .prefix  { color: #4ade80; background: #0f2a1a; }
  .line-rx .msg     { color: #86efac; }

  .line-tx .prefix  { color: #60a5fa; background: #0f1e2a; }
  .line-tx .msg     { color: #93c5fd; }

  .line-system .prefix { color: #a78bfa; background: #1a0f2a; }
  .line-system .msg    { color: #c4b5fd; }

  .line-error .prefix  { color: #f87171; background: #2a0f0f; }
  .line-error .msg     { color: #fca5a5; }

  /* ── Input bar ─────────────────────────────────────────────────────────── */
  .input-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #080a0f;
    border: 1px solid #1e2230;
    border-radius: 12px;
    padding: 0.6rem 0.75rem;
    margin-bottom: 0.75rem;
    transition: border-color 0.2s;
  }

  .input-bar:focus-within:not(.disabled) {
    border-color: #4f8ef740;
    box-shadow: 0 0 0 3px #4f8ef710;
  }

  .input-bar.disabled {
    opacity: 0.4;
  }

  .prompt {
    color: #4f8ef7;
    font-size: 1rem;
    user-select: none;
  }

  .input-bar input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #e2e8f0;
    font-family: inherit;
    font-size: 0.85rem;
    caret-color: #4f8ef7;
  }

  .input-bar input::placeholder {
    color: #2e3347;
  }

  .send-btn {
    background: #4f8ef720;
    color: #4f8ef7;
    border: 1px solid #4f8ef740;
    border-radius: 6px;
    padding: 0.3rem 0.75rem;
    font-family: inherit;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }

  .send-btn:not(:disabled):hover {
    background: #4f8ef740;
  }

  .send-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>
