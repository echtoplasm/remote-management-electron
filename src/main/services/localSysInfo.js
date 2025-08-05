const { ipcMain } = require('electron');
const si = require('systeminformation');
const os = require('os');


// function for local system system info 
const sysInfo = async() => {
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
};

// function for local system current load 
const currentLoad = async() => {
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
}


module.exports = {  sysInfo , currentLoad }
