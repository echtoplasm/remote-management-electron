const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const si = require('systeminformation');
const { readFileSync } = require('fs');
const { Client } = require('ssh2');

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.webContents.openDevTools();
};



app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle('get-system-info', async () => {
    try{

        const [cpu, mem, osInfo, graphics] = await Promise.all([
            si.cpu(),
            si.mem(),
            si.osInfo(),
            si.graphics()
        ])

        return {
            cpu: {
                manufacturer: cpu.manufacturer,
                brand: cpu.brand, 
                cores: cpu.cores,
                speed: cpu.speed
            },

            mem: {
                total: mem.total,
                free: mem.free, 
                used: mem.used,
                active: mem.active,
            },

            osInfo: {
                platform: osInfo.platform,
                distro: osInfo.distro,
                release: osInfo.release
            },

            graphics: graphics.controllers[0]?.model || 'Unknown'

        }


    }catch(err){
        console.error("unable to run ipcMain handle", err.message);
        return null
    }
})


ipcMain.handle('get-current-load', async () => {
    try{
        
        const [currentLoad, processes, sshAgent] = await Promise.all([
            new Promise((resolve) => si.currentLoad(resolve)),
            new Promise((resolve) => si.processes(resolve)),
            new Promise((resolve) => si.services("ssh-agent", resolve))

            //for callback function pass reslove to resolve the promise// 
        ])

        return {
            currentLoad : currentLoad.currentLoad,
            currentLoadUser: currentLoad.currentLoadUser,
            sshAgentBool: sshAgent
        }

    }catch(err){
        console.error(`ipcMain unable to handle get-current-load`)
        throw err;
    }
})



ipcMain.handle('ssh-connect-and-execute', async (event, config, command) => {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = '';

    conn.on('ready', () => {
    
        console.log('client: ready')
        
        conn.exec(command, (err, stream) => {
            if (err) {
                conn.end();
                return reject(err);
            }

            stream.on('close', (code, signal) => {
                console.log(`Stream: close ${code}, Signal: ${signal}`);
                conn.end();

                if (code === 0) {
                    resolve(output);
                }else{
                    reject(new Error(`command failed with exit code ${code}`))
                }


            }).on('data', (data) => {
                output += data.toString();
                console.log(`STDOUT: ${data}`)
            });
                stream.stderr.on('data', (data) => {
                    console.log(`STDERR: ${data}`);
                    reject(new Error(data.toString()));
            });

        });

    });

    conn.on('error', (err) => {
        reject(err);
    })

    conn.connect({
        host: config.host,
        port: config.port,
        username: config.username, 
        privateKey: config.privateKey
        });
    });
});
