// OSCPort.ts
export type OSCArg = number | string | boolean | Uint8Array;

export interface OSCParamOptions {
  type: 'f32' | 'i32' | 's' | 'b';
  min?: number;
  max?: number;
  default?: number | string | boolean;
}

export interface OSCAddressEntry {
  address: string;
  opts: OSCParamOptions;
}

export interface OSCServerStatus {
  running: boolean;
  port: number;
}

export type Unsubscribe = () => void;

export interface OSCPort {
  // Send
  send(address: string, args: OSCArg[]): void
  sendToHost(host: string, port: number, address: string, args: OSCArg[]): void

  // Receive
  on(address: string, handler: (args: OSCArg[]) => void): Unsubscribe
  onPattern(pattern: string, handler: (address: string, args: OSCArg[]) => void): Unsubscribe

  // Universe: expose all VOID parameters as OSC addresses
  exposeParameter(address: string, opts: OSCParamOptions): void
  unexposeParameter(address: string): void
  getExposedAddresses(): OSCAddressEntry[]

  // Server control
  startServer(port: number): Promise<void>
  stopServer(): Promise<void>
  getServerStatus(): OSCServerStatus
}
