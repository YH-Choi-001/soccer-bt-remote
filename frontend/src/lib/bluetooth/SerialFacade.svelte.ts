import type { BluetoothLink } from './BluetoothLink'

// ── Bluetooth Classic facade over the Web Serial API ───────────────────
// Chromium exposes RFCOMM services (e.g. Serial Port Profile) of Bluetooth
// Classic devices that are already paired with the OS as serial ports.
// See https://developer.chrome.com/blog/serial-over-bluetooth
export class SerialFacade implements BluetoothLink {
  private readonly port: SerialPort
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null
  private readLoopDone: Promise<void> | null = null
  private isClosingByUser = false

  isConnecting: boolean = $state(false)
  isConnected: boolean = $state(false)
  onReceived: (text: string) => void = () => {}
  onDisconnected: () => void = () => {}

  constructor(port: SerialPort) {
    this.port = port
  }

  /**
   * Opens the RFCOMM channel.
   * The baud rate is required by the API but is meaningless for Bluetooth
   * RFCOMM ports; the module's UART baud rate is configured on the module.
   */
  async connect(baudRate: number = 9600) {
    if (this.isConnected || this.isConnecting) return
    this.isConnecting = true
    try {
      await this.port.open({ baudRate })
      if (!this.port.writable) {
        throw new Error('Serial port is not writable')
      }
      this.writer = this.port.writable.getWriter()
      this.isClosingByUser = false
      this.isConnected = true
      this.readLoopDone = this.readLoop()
    } catch (e) {
      await this.closePort()
      throw e
    } finally {
      this.isConnecting = false
    }
  }

  async send(text: string) {
    if (!this.writer) {
      throw new Error('Not connected')
    }
    await this.writer.write(new TextEncoder().encode(text))
  }

  async disconnect() {
    this.isClosingByUser = true
    await this.reader?.cancel().catch(() => {})
    await this.readLoopDone
    await this.closePort()
  }

  getName(): string {
    // Web Serial does not expose the remote device's Bluetooth name.
    return 'Bluetooth Classic device'
  }

  private async readLoop() {
    const decoder = new TextDecoder('utf-8')
    // `port.readable` becomes null after a fatal error (e.g. device lost).
    // Non-fatal errors (e.g. buffer overrun) leave it usable, so retry.
    while (this.port.readable && !this.isClosingByUser) {
      this.reader = this.port.readable.getReader()
      try {
        while (true) {
          const { value, done } = await this.reader.read()
          if (done) break
          if (value) {
            const text = decoder.decode(value, { stream: true })
            if (text) this.onReceived(text)
          }
        }
      } catch {
        // Fall through; the outer loop decides whether the port is still usable.
      } finally {
        this.reader.releaseLock()
        this.reader = null
      }
    }

    if (!this.isClosingByUser) {
      await this.closePort()
      this.onDisconnected()
    }
  }

  private async closePort() {
    try {
      this.writer?.releaseLock()
    } catch {
      // Ignore: the writer may already be errored.
    }
    this.writer = null
    await this.port.close().catch(() => {})
    this.isConnected = false
  }

  /**
   * Shows the browser's port chooser, limited to Bluetooth ports offering
   * the given RFCOMM service class (defaults to Serial Port Profile).
   */
  static async request(serviceClassId: BluetoothServiceUUID = SPP_UUID): Promise<SerialFacade> {
    const port = await navigator.serial.requestPort({
      filters: [{ bluetoothServiceClassId: serviceClassId }],
      allowedBluetoothServiceClassIds: [serviceClassId],
    })
    return new SerialFacade(port)
  }

  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator
  }
}

/** Serial Port Profile (SPP) service class UUID, 16-bit form. */
export const SPP_UUID16 = '1101'
/** Serial Port Profile (SPP) service class UUID. */
export const SPP_UUID = `0000${SPP_UUID16}-0000-1000-8000-00805f9b34fb`
