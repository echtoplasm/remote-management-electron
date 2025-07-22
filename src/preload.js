const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld('electronAPI', {
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    getCurrentLoad: () => ipcRenderer.invoke('get-current-load'),
    sshConnectExec: (config, command) => ipcRenderer.invoke('ssh-connect-and-execute', config, command),
    webSocketConnect: (data) => ipcRenderer.invoke('webSocketCommunication', data),
    spawnSSHtunnel: (localPort, remotePort, remoteUser, remoteHost) => ipcRenderer.invoke('spawnSSHtunnel', localPort, remotePort, remoteUser, remoteHost)
})


