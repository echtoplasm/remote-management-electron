const cpuSpecsDiv = document.querySelector("#cpu-specs");
const memSpecsDiv = document.querySelector("#mem-specs");
const osInfoDiv = document.querySelector("#os-info");


const loadSystemSpecs = async () => {
    try{
        
        const specs = await window.electronAPI.getSystemInfo();
        const binaryMemPow = (1024 ** 3);
        const memoryTotalGb = (specs.mem.total / binaryMemPow).toFixed(2); // binary memory transformer //
        const memoryActiveGb = (specs.mem.active / binaryMemPow).toFixed(2); // active memory binary transformer //
        const memoryFreeGb = (specs.mem.free / binaryMemPow).toFixed(2);
        const memoryUsedGb = (specs.mem.used / binaryMemPow).toFixed(2);

        console.log(specs);

        cpuSpecsDiv.innerHTML = (
        `<p><strong>CPU:</strong><br> Brand: ${specs.cpu.brand}<br> Cores: ${specs.cpu.cores}<br> Speed: ${specs.cpu.speed}<br></p>`
        )

        memSpecsDiv.innerHTML = (
        `<p><strong>Memory:</strong><br> Total: ${memoryTotalGb} gb <br> Free: ${memoryFreeGb} gb 
        <br> Used: ${memoryUsedGb} gb <br> Active: ${memoryActiveGb} gb</p>`
        )

        osInfoDiv.innerHTML = (
        `<p><strong>Operating System Info:</strong><br> Platform: ${specs.osInfo.platform}<br> Distro: ${specs.osInfo.distro}<br> Release: ${specs.osInfo.release}<br></p>`
        )
    }catch(err){
        console.error("error loading system specs", err.message);
    }
}

setInterval(async () => {
    await loadSystemSpecs();
}, 3000);

const sshAgentDiv = document.querySelector("#ssh-agent");
const currentLoadDiv = document.querySelector("#current-load");

const loadCurrentLoadSpecs = async () => {
    const currentLoadSpecs = await window.electronAPI.getCurrentLoad();
    console.log(currentLoadSpecs);
    

    currentLoadDiv.innerHTML = (
    `<p><strong>Current CPU usage Load</strong>: ${currentLoadSpecs.currentLoad.toFixed(2)}%</p>
    <p><strong>Current CPU usage load from user processes:</strong>: ${currentLoadSpecs.currentLoadUser.toFixed(2)}%</p>`
    )

    sshAgentDiv.innerHTML = (
    `<p><strong>SSH Agent running? : </strong> ${currentLoadSpecs.sshAgentBool[0].running}</p>`
    )
}

loadCurrentLoadSpecs();


let config = {};

const sshForm = document.querySelector("#ssh-form");

sshForm.addEventListener('submit', async (event) =>{
    event.preventDefault();
    
    const host = document.querySelector("#host").value;
    const port = document.querySelector("#port").value;
    const username = document.querySelector("#username").value;
    const command = document.querySelector("#command").value;
    const password = document.querySelector("#password").value;
    const sshResults = document.querySelector("#sshresults");

    const portInt = parseInt(port);

    console.log(`port: ${portInt} Object type ${typeof(portInt)}`);
    
    let config = { host, portInt, username, password }

    console.log(config);
    
    console.log(host);
    console.log(typeof(host));

    try{

        const result = await window.electronAPI.sshConnectExec(config, command);
        console.log('SSH result:', result);
        sshResults.innerHTML = (`<p>${result}</p>`);
    }catch(err){
        console.error('SSH error:', err)
    }
    
})


const testWebSockets = async(event, data) => {
    try{
        const result = await window.electronAPI.webSocketConnect('test data');
        console.log('Websocket result', result)
    }catch(err){
        console.error('Websocket error', err.message)
    }
}

testWebSockets();

const testSSHtunnel = async() => {
    try{
        const sshResults = await window.electronAPI.spawnSSHtunnel('8080', '22', 'zacha', '157.230.7.127');
        console.log("ssh tunnel results:", sshResults);
    }catch(err){
        console.error("Unable to connect to sshtunnel from renderer.js", err.message);
    }
}

testSSHtunnel();

