const { ipcMain } = require('electron');
const { sshGuiExec, spawnTunnel, tunnelWebSockets, dockerVersion } = require ('../services/sshManager.js');
const { sysInfo, currentLoad } =  require('../services/localSysInfo.js');
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
    ipcMain.handle('sshUserExec', async(event, config, command) => {
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
    
    // DB IPC's 
    ipcMain.handle('saveCredentials', async(event, credData) => {
        return db.saveCredentials(credData);
    });

    ipcMain.handle('getCredentials', async(event ,name) => {
        return db.getCredentials(name);
    });
    
    //change the sql method because this is almost the exact same as get creds
    ipcMain.handle('listCredentials', async(event, name) => {
        return db.listCredentials(name);
    });

    ipcMain.handle('deleteCredentials', async(event, name) => {
        return db.deleteCredentials(name);
    });
    
    //REMOTE SERVER TABLE IPC's
    ipcMain.handle('insertRemoteServers' , async(event, remoteData) => {
        return db.insertRemoteServers(remoteData);    
    });

    ipcMain.handle('getRemoteServer' , async(event, ipv4) => {
        return db.getRemoteServer(ipv4);
    });
    
    ipcMain.handle('listRemoteServers' , async(event) => {
        return db.listRemoteServers();
    });

    ipcMain.handle('deleteRemoteServer' , async(event, ipv4) => {
        return db.deleteRemoteServer(ipv4);
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

/*    
    ipcMain.handle('' , async() => {

    });
    
    ipcMain.handle('' , async() => {

    });
*/
}


module.exports = { setupIPC };
