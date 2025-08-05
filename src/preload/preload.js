const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld('electronAPI', {
    getSystemInfo: () => ipcRenderer.invoke('getSystemInfo'),
    getCurrentLoad: () => ipcRenderer.invoke('getCurrentLoad'),
    sshConnectExec: (config, command) => ipcRenderer.invoke('sshUserExec', config, command),
    webSocketConnect: (data) => ipcRenderer.invoke('webSocketComm', data),
    spawnSSHtunnel: (localPort, remotePort, remoteUser, remoteHost, password) => ipcRenderer.invoke('spawnSSHtunnel', localPort, remotePort, remoteUser, remoteHost, password),
    dockerCheck: (data) => ipcRenderer.invoke('dockerVersion', data)
})


