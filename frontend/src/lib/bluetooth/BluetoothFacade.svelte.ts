// ── Bluetooth facade class (singleton) ─────────────────────────────────
export class BluetoothFacade {
  readonly NUS_RX_CHAR = BluetoothFacade.uuid16To128('fff2')
  readonly NUS_TX_CHAR = BluetoothFacade.uuid16To128('fff1')

  private readonly device: BluetoothDevice
  private readonly serviceUUID: BluetoothServiceUUID
  private server: BluetoothRemoteGATTServer | null = $state(null)
  private rxChar: BluetoothRemoteGATTCharacteristic | null = null
  private txChar: BluetoothRemoteGATTCharacteristic | null = $state(null)

  isConnecting: boolean = $state(false)
  isConnected: boolean = $derived(!!this.server?.connected)
  onReceived: (text: string) => void = () => {}
  onDisconnected: () => void = () => {}

  private mtu: number = 20

  constructor(device: BluetoothDevice, serviceUUID: BluetoothServiceUUID) {
    this.device = device
    this.serviceUUID = serviceUUID
  }

  async connect() {
    if (!this.device?.gatt) return
    if (this.server) return
    this.isConnecting = true
    try {
      this.server = await this.device.gatt.connect()

      const service = await this.server.getPrimaryService(this.serviceUUID)
      this.rxChar = await service.getCharacteristic(this.NUS_RX_CHAR)
      this.txChar = await service.getCharacteristic(this.NUS_TX_CHAR)

      await this.txChar.startNotifications()
      this.txChar.addEventListener('characteristicvaluechanged', this.onReceivedEvent)
      this.device.addEventListener('gattserverdisconnected', this.onDisconnectedEvent)
    } catch (e) {
      this.server = null
      this.rxChar = null
      this.txChar = null
      throw e
    } finally {
      this.isConnecting = false
    }
  }

  async send(text: string) {
    if (!this.rxChar) {
      throw new Error('No RX characteristic')
    }
    const bytes = new TextEncoder().encode(text)
    for (let i = 0; i < bytes.length; i += this.mtu) {
      await this.rxChar.writeValueWithResponse(bytes.slice(i, i + this.mtu))
    }
  }

  async disconnect() {
    if (this.txChar) {
      this.txChar.removeEventListener('characteristicvaluechanged', this.onReceivedEvent)
      await this.txChar.stopNotifications().catch(() => {})
    }
    this.server?.disconnect()
    this.rxChar = null
    this.txChar = null
    this.server = null
  }

  getDevice(): BluetoothDevice | null {
    return this.device
  }

  private readonly onReceivedEvent = (event: Event) => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value
    if (!value) return
    const text = new TextDecoder('utf-8').decode(value)
    this.onReceived(text)
  }

  private readonly onDisconnectedEvent = () => {
    this.onDisconnected()
    this.server = null
    this.rxChar = null
    this.txChar = null
  }

  static async scan(
    serviceUUID: BluetoothServiceUUID,
    scanOptions?: RequestDeviceOptions
  ): Promise<BluetoothFacade> {
    const device = await navigator.bluetooth.requestDevice(scanOptions)
    return new BluetoothFacade(device, serviceUUID)
  }

  static uuid16To128(uuid: string): BluetoothServiceUUID {
    return `0000${uuid}-0000-1000-8000-00805f9b34fb`
  }
}
