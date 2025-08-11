const { ipcMain } = require('electron');
const { Client } = require('ssh2');
const WebSocket = require('ws');

// var for holding the continous ssh connection 
let sshConnection = null;

// GUI ssh exec for user interactivity 
const sshGuiExec = async(config, command) => {
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
            port: config.portInt,
            username: config.username, 
            password: config.password
            });
        });
};


// Spawn SSH tunnel will be exported to IPC handler in ipc/ 
const spawnTunnel = (localPort, remotePort, remoteUser, remoteHost, password) => {
        return new Promise((resolve, reject) => {
            const conn = new Client();
            let output = ''
            
            conn.on('ready', () =>{
                console.log('SSH client for tunneling :::: ready');
                conn.forwardIn('127.0.0.1', localPort, (err) => {
                    if (err) {
                        return reject(err);
                    }else{
                        console.log('SSH tunnel established on port', localPort);
                        resolve({ 
                            tunnelReady: true,
                            localPort: localPort,
                            remotePort: remotePort, 
                            status: 'connected'
                        });

                       sshConnection = conn; 
                    }    
                });

            }).on('tcp-connection', (info, accept, reject) => {
                const stream = accept();
                
                conn.forwardOut(info.srcIP, info.srcPort, '127.0.0.1', remotePort, (err, upstream) => {
                        if (err) {
                            stream.end();
                        }
                    })

            }).on('error', () => {
                console.error('SSH Client :: error ::', err.message);
                reject(err)
                setTimeout(spawnSSHtunnel, 5000);
            }).connect({
                host: remoteHost,
                port: 22,
                username: remoteUser,
                password: password
            });
        });
};


// function for websockets that tunnel through ssh 
const tunnelWebSockets = async(data) => {
    return new Promise((resolve, reject) => {

        const socket = new WebSocket(`ws://localhost:8080`);
        let resolved = false
        const timeout = setTimeout(() => {
            if(!resolved){
                resolved = true;
                reject(new Error('Websocket Communication timeout'));
            }
        }, 30000);
    
        
        socket.addEventListener('open', event => {
            console.log('Socket connection established.');
            socket.send(data);
                   
        });

        socket.addEventListener('message', event => { 
            console.log ('message from server:', event.data)
            if(!resolved){
                resolved = true;
                clearTimeout(timeout);
                resolve({
                    success: true, 
                    message: 'Message recieved',
                    data: event.data
                });
            }
        });

        socket.addEventListener('close', event => {
            console.log('Websocket connection closed:', event.code, event.reason)
            if (!resolved){
                resolved = true;
                clearTimeout(timeout);
                resolve({
                    success: false,
                    code: event.code,
                    reason: event.reason
                });
            }
        });

        socket.addEventListener('error', error => {
            console.log('error occurred', error);
            if(!resolved) {
                resolved = true;
                clearTimeout(timeout)
                reject(error);
                }
            });
        });
};


//docker ssh command for docker --version sanity check 
const dockerVersion = async(data) => {
    return new Promise ((resolve, reject) => {
        const conn = sshConnection;
        let output = '';

        conn.exec('docker --version', (err, stream) => {
            if(err){
                return reject(err);
                console.error(err.message);
            }else{
                console.log('no err passing command to conn.exec');
            }
            
            stream.on('close', (code, signal) => {
                console.log(`stream close ${code}, Signal: ${signal}`);
                conn.end;

                if (code === 0) {
                    output += data.toString();
                    resolve({ dockerInstalled: true, version: output });
                } else if(code !== 0) {
                    resolve({ dockerInstalled: false });
                }
            }).on('data', (data) => {
                    output += data.toString();
                    console.log(`STDOUT for docker version: ${output}`);
                });

            stream.stderr.on('data', (data) => {
                console.log(`STDERR for docker version: ${data}`);
                reject(new Error(data.toString()));
            });
        });
    
        conn.on('error', (err) => {
            reject(err);
        });
    });
}



module.exports = { sshGuiExec, spawnTunnel, dockerVersion, tunnelWebSockets };

