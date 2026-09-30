const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  startGoogleOAuth: (options) => ipcRenderer.invoke('oauth:start-loopback', options),
});
