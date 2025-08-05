const { ipcMain } = require('electron');
const { sshGuiExec, spawnTunnel, tunnelWebSockets, dockerVersion } = require ('../services/sshManager.js');
const { sysInfo, currentLoad } =  require('../services/localSysInfo.js');


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
    
    // setup SQLite
    // write business logic for sqlite 
    // setup IPC routes
}


module.exports = { setupIPC };
