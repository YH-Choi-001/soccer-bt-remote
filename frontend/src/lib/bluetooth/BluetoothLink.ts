// ── Common interface for a connected (or connecting) Bluetooth link ─────
// Implemented by BluetoothFacade (BLE via Web Bluetooth) and
// SerialFacade (Bluetooth Classic via Web Serial).

export type BluetoothMode = 'ble' | 'classic'

export interface BluetoothLink {
  readonly isConnecting: boolean
  readonly isConnected: boolean
  onReceived: (text: string) => void
  onDisconnected: () => void
  send(text: string): Promise<void>
  disconnect(): Promise<void>
  getName(): string
}
