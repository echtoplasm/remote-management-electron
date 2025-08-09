const { contextBridge, ipcRenderer } = require("electron")


//access by: "window.electronAPI.system.getSystemInfo" instead of "window.electronAPI.someMethod"

contextBridge.exposeInMainWorld('electronAPI', {
    //sys info
    system: {
        getSystemInfo: () => ipcRenderer.invoke('getSystemInfo'),
        getCurrentLoad: () => ipcRenderer.invoke('getCurrentLoad')
    },
    
    //ssh ops
    ssh: {
        sshConnectExec: (config, command) => ipcRenderer.invoke('sshUserExec', config, command),
        spawnSSHtunnel: (localPort, remotePort, remoteUser, remoteHost, password) => ipcRenderer.invoke('spawnSSHtunnel', localPort, remotePort, remoteUser, remoteHost, password),
        dockerCheck: (data) => ipcRenderer.invoke('dockerVersion', data)
    },

    //websocket
    websocket: {
        webSocketConnect: (data) => ipcRenderer.invoke('webSocketComm', data),
    },
    
    //db ops
    db: {
        //users table
        saveCredentials: (credData) => ipcRenderer.invoke('saveCredentials', credData),
        getCredentials: (name) => ipcRenderer.invoke('getCredentials', name),
        listCredentials: (name) => ipcRenderer.invoke('listCredentials', name),
        deleteCredentials: (name) => ipcRenderer.invoke('deleteCredentials', name),
        
        //remote servers table
        insertRemoteServers: (remoteData) => ipcRenderer.invoke('insertRemoteServers', remoteData),
        getRemoteServer: (ipv4) => ipcRenderer.invoke('getRemoteServer', ipv4),
        listRemoteServers: () => ipcRenderer.invoke('listRemoteServers'),
        deleteRemoteServer: (ipv4) => ipcRenderer.invoke('deleteRemoteServer', ipv4),
        
        //docker containers table 
        insertDockerContainer: (containerData) => ipcRenderer.invoke('insertDockerContainer', containerData),
        getDockerContainer: (containerName) => ipcRenderer.invoke('getDockerContainer', containerName),
        listContainers: () => ipcRenderer.invoke('listContainers'),
        deleteContainer: (containerId) => ipcRenderer.invoke('deleteContainer', containerId),
        
        //container logs table 
        insertContainerLog: (logData) => ipcRenderer.invoke('insertContainerLog', logData),
        getContainerLog: (containerId) => ipcRenderer.invoke('getContainerLog', containerId),
        deleteContainerLog: (containerLogId) => ipcRenderer.invoke('deleteContainerLog', containerLogId)
    },

    env: {
        LOCAL_PORT: process.env.LOCAL_PORT,
        REMOTE_PORT: process.env.REMOTE_PORT,
        SSH_USER: process.env.SSH_USER,
        SSH_HOST: process.env.SSH_HOST,
        SSH_PASSWORD: process.env.SSH_PASSWORD
    },

    nav: {
        navigate: (page) => ipcRenderer.invoke('navigate-to', page) 
    }
})


