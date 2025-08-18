const { sshConnExec } = require('../services/sshManager.js');

//need to refactor to allow the user to pass the params
const dockerPs = async (ipv4_address, port_number, username, password) => {
    const command = 'docker ps --format json';
    const config = { host: ipv4_address, 
                     port: port_number, 
                     username: username, 
                     password: password }

    const containersJson = await sshConnExec(config, command);
    
    const containers = containersJson
                        .trim()
                        .split('\n')
                        .filter(line => line.trim())
                        .map(line => JSON.parse(line));

    return containers;
    
}

module.exports = { dockerPs };
