const testWebSockets = async(event, data) => {
    try{
        const result = await window.electronAPI.websocket.webSocketConnect('test data');
        console.log('Websocket result', result)
    }catch(err){
        console.error('Websocket error', err.message)
    }
}

testWebSockets();

const testDockerVersion = async() => {
    try{
        const sshResults = await window.electronAPI.ssh.spawnSSHtunnel(
            window.electronAPI.env.LOCAL_PORT,
            window.electronAPI.env.REMOTE_PORT,
            window.electronAPI.env.SSH_USER,
            window.electronAPI.env.SSH_HOST,
            window.electronAPI.env.SSH_PASSWORD
        );
        
        console.log(sshResults);

        const dockerVersion = await window.electronAPI.ssh.dockerCheck({});

        console.log(dockerVersion);
    
    }catch(err){            
        console.error('error in processing the docker version and sshresults:', err.message);
    }
};

testDockerVersion();

