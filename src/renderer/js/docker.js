const showOSSelection = () => {
    return new Promise((resolve, reject) => {
        const modalHTML = `
            <div id="osModal" class="modal-overlay">
                <div class="modal">
                    <h3>Select Server operating system</h3>
                    <p>Please select which operating system your remote server uses</p>
                    <div class="os-buttons">
                        <button class="os-btn" data-os="ubuntu">Ubuntu</button>
                        <button class="os-btn" data-os="centos">CentOS</button>
                        <button class="os-btn" data-os="debian">Debian</button>
                        <button class="os-btn" data-os="RHEL">RHEL</button>
                    </div>
                    <div class="modal-actions">
                        <button id="cancelBtn">Cancel</button>
                        <button id="installBtn">Install Docker</button>
                    </div>
                </div>
            </div>
        `;


        document.body.insertAdjacentHTML('beforeend', modalHTML);

        let selectedOS = null;
        const modal = document.getElementById('osModal');
        const installBtn = document.getElementById('installBtn');

        document.querySelectorAll('.os-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.os-btn').forEach(b => bclassList.remove('selected'));
                this.classList.add('selected');
                selectedOS = this.getAttribute('data-os');
                installBtn.disabled = false;
            });
        });
        
        document.getElementById('cancelBtn').addEventListener('click', () => {
            modal.remove();
            resolve(null)
        });

        installBtn.addEventListener('click', () => {
            modal.remove();
            resolve(selectedOS);
        });
    });
};

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

        const dockerCheck = await window.electronAPI.ssh.dockerCheck({});

        console.log(dockerCheck);
        console.log(dockerCheck.version);
        console.log(dockerCheck.dockerInstalled);

        if(!dockerCheck.dockerInstalled) { 
            const userAgreed = confirm("Docker not installed. Would you like gnosis to go ahead and download docker on this remote system?");

            if (userAgreed) {
                const selectedOS = await showOSSelection();

                if(selectedOS){
                    const installCommands = await window.electronAPI.ssh.installDockerForOS(selectedOS);
                    const host = await window.electronAPI.env.SSH_HOST;
                    const port = await window.electronAPI.env.REMOTE_PORT;
                    const username = await window.electronAPI.env.SSH_USER; 
                    const password = await window.electronAPI.env.SSH_PASSWORD;

                    let config = { host, port, username, password };

                    const prereqsResult = await window.electronAPI.ssh.sshConnectExec(config, installCommands.prereqs);
                    console.log(prereqsResult);

                    const configResult = await window.electronAPI.ssh.sshConnectExec(config, installCommands.config);
                    console.log(configResult);

                    const commandResult = await window.electronAPI.ssh.sshConnectExec(config, installCommands.command);
                    console.log(commandResult);

                }else{
                    console.log('User cancelled OS selection');
                };
            };
        };
         
    }catch(err){            
        console.error('error in processing the docker version and sshresults:', err.message);
    }
};

testDockerVersion();

module.exports = {
    testDockerVersion
}
