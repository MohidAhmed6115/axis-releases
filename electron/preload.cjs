const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  startGoogleOAuth: (authUrl) => ipcRenderer.invoke('start-google-oauth', authUrl),
});
