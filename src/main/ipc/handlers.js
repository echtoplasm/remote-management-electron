const { ipcMain, BrowserWindow } = require('electron');
const { sshGuiExec, spawnTunnel, tunnelWebSockets, dockerVersion, installDockerForOS, getServerCreds } = require ('../services/sshManager.js');
const { sysInfo, currentLoad } =  require('../services/localSysInfo.js');
const { dockerPs } = require('../services/dockerService.js');
const nav = require('../services/navigationManager.js');
const db = require('../services/dbManager.js');



const setupIPC = () => {
    //sysInfo IPC's
    ipcMain.handle('getSystemInfo', async() => {
        return sysInfo();
    });

    ipcMain.handle('getCurrentLoad', async() => {
        return currentLoad();
    });

    //SSH IPC's
    ipcMain.handle('sshConnExec', async(event, config, command) => {
        return sshGuiExec(config, command);
    });
    
    ipcMain.handle('spawnSSHtunnel', async(event, localPort, remotePort, remoteUser, remoteHost, password) => {
        return spawnTunnel(localPort, remotePort, remoteUser, remoteHost, password);
    });

    ipcMain.handle('webSocketComm', async(event, data) => {
        return tunnelWebSockets(data);
    });

    ipcMain.handle('dockerVersion', async(event, data) => {
        return dockerVersion(data);
    });
   
    ipcMain.handle('installDockerForOS', async(event, selectedOS) => {
        return installDockerForOS(selectedOS);
    });

    // DB IPC's 
    ipcMain.handle('saveCredentials', async(event, credData) => {
        return db.saveCredentials(credData);
    });

    ipcMain.handle('getCredentials', async(event ,name) => {
        return db.getCredentials(name);
    });

    //Docker IPCS's 
    
    ipcMain.handle('dockerPs', async(event, ipv4_address, port_number, username, password) => {
        return dockerPs(ipv4_address, port_number, username, password)
    })
    
    //change the sql method because this is almost the exact same as get creds
    ipcMain.handle('listCredentials', async(event, name) => {
        return db.listCredentials(name);
    });

    ipcMain.handle('deleteCredentials', async(event, name) => {
        return db.deleteCredentials(name);
    });

    //get server credentials to be passed between remotejs and dockerjs 

    ipcMain.handle('getServerCreds', async(event, serverId) => {
        return db.getServerCreds(serverId);
    })
    
    //REMOTE SERVER TABLE IPC's
    ipcMain.handle('insertRemoteServers' , async(event, remoteData) => {
        return db.insertRemoteServers(remoteData);    
    });

    ipcMain.handle('getRemoteServer' , async(event, ipv4_address) => {
        return db.getRemoteServer(ipv4_address);
    });
    
    ipcMain.handle('listRemoteServers' , async(event) => {
        return db.listRemoteServers();
    });

    ipcMain.handle('deleteRemoteServer' , async(event, ipv4_address) => {
        return db.deleteRemoteServer(ipv4_address);
    });
    
    //DOCKER CONTAINERS TABLE
    ipcMain.handle('insertDockerContainer' , async(event, containerData) => {
        return db.insertDockerContainer(containerData);
    });

    ipcMain.handle('getDockerContainer' , async(event, containerName) => {
        return db.getDockerContainer(containerName);
    });

    ipcMain.handle('listContainers' , async(event) => {
        return db.listContainers() 
    });

    ipcMain.handle('deleteContainer' , async(event, containerId) => {
        return db.deleteContainer(containerId);
    });
    
    //CONTAINER LOGS TABLE
    ipcMain.handle('insertContainerLog' , async(event, logData) => {
        return db.insertContainerLog(logData);        
    });
    
    ipcMain.handle('getContainerLog' , async(event, containerId) => {
        return db.getContainerLog(containerId);
    });

    ipcMain.handle('deleteContainerLog' , async(containerLogId) => {
        return db.deleteContainerLog(containerLogId)
    });

    //IPC for handling page navifation to avoid ridiculous frontend dom manipulation
    ipcMain.handle('navigate-to' , (event, page) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        window.loadFile(`src/renderer/${page}`);
    });
};


module.exports = { setupIPC };
