const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld('electronAPI', {
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    getCurrentLoad: () => ipcRenderer.invoke('get-current-load')
})


