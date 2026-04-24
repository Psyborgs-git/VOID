import { contextBridge, ipcRenderer } from 'electron';

export const voidAPI = {
  ping: () => ipcRenderer.invoke('void:ping'),
  // Event bus and other IPC channels will be mapped here
};

contextBridge.exposeInMainWorld('voidAPI', voidAPI);
