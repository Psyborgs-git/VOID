import { Unsubscribe } from './MIDIPort'

/**
 * OSC argument types
 */
export type OSCArg = number | string | boolean | Blob

/**
 * OSC parameter options
 */
export interface OSCParamOptions {
  type: 'f' | 'i' | 's' | 'b' // float, int, string, boolean
  min?: number
  max?: number
  description?: string
}

/**
 * OSC address entry
 */
export interface OSCAddressEntry {
  address: string
  type: 'f' | 'i' | 's' | 'b'
  description: string
  currentValue?: OSCArg
}

/**
 * OSC server status
 */
export interface OSCServerStatus {
  running: boolean
  port: number
  address: string
}

/**
 * OSCPort - interface for OSC communication
 *
 * All OSC adapters must implement this interface.
 * Implementation: OSCAdapter (node-osc in main process)
 */
export interface OSCPort {
  // Send operations
  /**
   * Send OSC message to the default destination
   * @param address OSC address
   * @param args OSC arguments
   */
  send(address: string, args: OSCArg[]): void

  /**
   * Send OSC message to a specific host
   * @param host Target host
   * @param port Target port
   * @param address OSC address
   * @param args OSC arguments
   */
  sendToHost(host: string, port: number, address: string, args: OSCArg[]): void

  // Receive operations
  /**
   * Listen for OSC messages on a specific address
   * @param address OSC address to listen on
   * @param handler Message handler
   * @returns Unsubscribe function
   */
  on(address: string, handler: (args: OSCArg[]) => void): Unsubscribe

  /**
   * Listen for OSC messages matching a pattern
   * @param pattern OSC address pattern
   * @param handler Message handler
   * @returns Unsubscribe function
   */
  onPattern(pattern: string, handler: (address: string, args: OSCArg[]) => void): Unsubscribe

  // Universe management
  /**
   * Expose a parameter in the OSC universe
   * @param address OSC address
   * @param opts Parameter options
   */
  exposeParameter(address: string, opts: OSCParamOptions): void

  /**
   * Remove a parameter from the OSC universe
   * @param address OSC address
   */
  unexposeParameter(address: string): void

  /**
   * Get all exposed OSC addresses
   * @returns Array of address entries
   */
  getExposedAddresses(): OSCAddressEntry[]

  // Server control
  /**
   * Start OSC server
   * @param port Port to listen on
   */
  startServer(port: number): Promise<void>

  /**
   * Stop OSC server
   */
  stopServer(): Promise<void>

  /**
   * Get server status
   * @returns Server status
   */
  getServerStatus(): OSCServerStatus

  // Client management
  /**
   * Add a remote OSC client
   * @param name Client name
   * @param host Client host
   * @param port Client port
   */
  addClient(name: string, host: string, port: number): void

  /**
   * Remove a remote OSC client
   * @param name Client name
   */
  removeClient(name: string): void
}
