// PluginPort.ts
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  type: string[];
  wasm: string;
  ui?: string;
  ports: {
    'audio-in'?: number;
    'audio-out'?: number;
    params: {
      id: string;
      name: string;
      min: number;
      max: number;
      default: number;
    }[];
  };
  'osc-prefix': string;
}

export interface PluginPort {
  registerPlugin(manifest: PluginManifest): void;
  instantiatePlugin(pluginId: string): Promise<string>;
  hotReloadPlugin(pluginId: string): Promise<void>;
}
