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
        sshConnectExec: (config, command) => ipcRenderer.invoke('sshConnExec', config, command),
        spawnSSHtunnel: (localPort, remotePort, remoteUser, remoteHost, password) => ipcRenderer.invoke('spawnSSHtunnel', localPort, remotePort, remoteUser, remoteHost, password),
        dockerCheck: (data) => ipcRenderer.invoke('dockerVersion', data),
        installDockerForOS: (selectedOS) => ipcRenderer.invoke('installDockerForOS', selectedOS)
    },

    //websocket
    websocket: {
        webSocketConnect: (data) => ipcRenderer.invoke('webSocketComm', data),
    },
    
    //db ops
    db: {
        //users table
        saveCredentials: (credData) => ipcRenderer.invoke('saveCredentials', credData),
        getCredentials: (ipv4_address) => ipcRenderer.invoke('getCredentials', ipv4_address),
        listCredentials: (ipv4_address) => ipcRenderer.invoke('listCredentials', ipv4_address),
        deleteCredentials: (ipv4_address, port) => ipcRenderer.invoke('deleteCredentials', ipv4_address, port),
        
        //remote servers table
        insertRemoteServers: (remoteData) => ipcRenderer.invoke('insertRemoteServers', remoteData),
        getRemoteServer: (ipv4_addresss) => ipcRenderer.invoke('getRemoteServer', ipv4_address),
        listRemoteServers: () => ipcRenderer.invoke('listRemoteServers'),
        deleteRemoteServer: (ipv4_address) => ipcRenderer.invoke('deleteRemoteServer', ipv4_address),
        
        //docker containers table 
        insertDockerContainer: (containerData) => ipcRenderer.invoke('insertDockerContainer', containerData),
        getDockerContainer: (containerName) => ipcRenderer.invoke('getDockerContainer', containerName),
        listContainers: () => ipcRenderer.invoke('listContainers'),
        deleteContainer: (containerId) => ipcRenderer.invoke('deleteContainer', containerId),
        
        //container logs table 
        insertContainerLog: (logData) => ipcRenderer.invoke('insertContainerLog', logData),
        getContainerLog: (containerId) => ipcRenderer.invoke('getContainerLog', containerId),
        deleteContainerLog: (containerLogId) => ipcRenderer.invoke('deleteContainerLog', containerLogId),

        //get server credentials for remote server and for ssh creds to be passed to dockerPs
        getServerCreds: (serverId) => ipcRenderer.invoke('getServerCreds', serverId)
    },

    env: {
        LOCAL_PORT: process.env.LOCAL_PORT,
        REMOTE_PORT: process.env.REMOTE_PORT,
        SSH_USER: process.env.SSH_USER,
        SSH_HOST: process.env.SSH_HOST,
        SSH_PASSWORD: process.env.SSH_PASSWORD
    },

    nav: {
        newWindow: (options) => ipcRenderer.invoke('openNewWindow', options),
        navigate: (page) => ipcRenderer.invoke('navigate-to', page)
    },

    docker: {
        dockerPs: (ipv4_address, port_number, username, password) => ipcRenderer.invoke('dockerPs', ipv4_address, port_number, username, password) 
    }
})


