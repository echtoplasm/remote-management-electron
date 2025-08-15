const {app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const openNewWindow = (options) => {
    const newWindow = new BrowserWindow({
        width: options.width || 800,
        height: options.height || 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true, 
            preload: path.join(__dirname, 'preload.js')
        }
    });

    newWindow.loadFile(options.url);
    return newWindow.id
};


module.exports = {
    openNewWindow
}
