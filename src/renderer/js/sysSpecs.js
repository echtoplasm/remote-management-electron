const cpuSpecsDiv = document.querySelector("#cpu-specs");
const memSpecsDiv = document.querySelector("#mem-specs");
const osInfoDiv = document.querySelector("#os-info");

const loadSystemSpecs = async () => {
    try{
        
        const specs = await window.electronAPI.system.getSystemInfo();
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


const currentLoadDiv = document.querySelector("#current-load");

const loadCurrentLoadSpecs = async () => {
    const currentLoadSpecs = await window.electronAPI.system.getCurrentLoad();
    console.log(currentLoadSpecs);
    

    currentLoadDiv.innerHTML = (
    `<p><strong>Current CPU usage Load</strong>: ${currentLoadSpecs.currentLoad.toFixed(2)}%</p>
    <p><strong>Current CPU usage load from user processes:</strong>: ${currentLoadSpecs.currentLoadUser.toFixed(2)}%</p>`
    )

}

loadCurrentLoadSpecs();

