const { sshConnExec } = require('../services/sshManager.js');


const dockerPs = async () => {
    const command = 'docker ps --format json';
    const config = { host: process.env.SSH_HOST, 
                     port: process.env.REMOTE_PORT, 
                     username: process.env.SSH_USER, 
                     password: process.env.SSH_PASSWORD }

    const containersJson = await sshConnExec(config, command);
    
    const firstLine = containersJson.trim().split('\n')[0];
    const containersParsed = JSON.parse(firstLine);

    return containersParsed;
    
}

module.exports = { dockerPs };
