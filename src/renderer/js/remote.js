const scanForContainers = async (credentials) => {
    const scanResults = await window.electronAPI.docker.dockerPs(credentials.ipv4_address, 
                                                                 credentials.port_number,
                                                                 credentials.username, 
                                                                 credentials.password)
    console.log(scanResults); 
    console.log(`ITS ALIVE! 🧟‍♂️🔬 DOCKER SCAN ON ${credentials.ipv4_address} SUCCESSFUL`);
}

//method to close notification cards, pass value as string 
const closeNotif = async (id) => {
    const notif = document.getElementById(id);   
    console.log(notif); 
    if(notif){
        notif.remove();
    }
}




const getServerCreds = async(serverId) => {
    const rsListDiv = document.getElementById("remoteServerList");
    const creds = await window.electronAPI.db.getServerCreds(serverId);
    console.log(creds);
    window.credentials = creds;
   

    const dockerConfirmationModal = document.createElement('div');

    dockerConfirmationModal.className = 'notif-card';
    dockerConfirmationModal.id = 'manageContainerModal'
    dockerConfirmationModal.innerHTML = (`
        <h3>Added Remote Server: ${creds.ipv4_address} to Docker Management </h3>
        <small>
            Closing this window will still allow manual insertion of the docker Containers
            <b>OR</b> automated server scanning at a later date
            
            If closed the docker containers on this remote server will not be stored.
        </small>
        <button id="dockerScan" class="btn">Scan for docker containers</button>
        <button id="closeDockerScan" class="btn">Close</button>
    `)

    rsListDiv.appendChild(dockerConfirmationModal);
    
    const dockerScan = document.getElementById('dockerScan');
    dockerScan.addEventListener('click', () => scanForContainers(creds));
    
    const closeDockerScan = document.getElementById("closeDockerScan");
    closeDockerScan.addEventListener('click', () => closeNotif('manageContainerModal'));

};

const deleteServer = async(ipv4_address) => {

    const serverElement = document.getElementById(ipv4_address);
    
    if (serverElement){
        serverElement.remove()
    }
    
    let deleteResult = await window.electronAPI.db.deleteRemoteServer(ipv4_address);
} 


// fetch all servers being managed
const fetchAllServers = async () => {
    const results = await window.electronAPI.db.listRemoteServers();
    console.log(results);

    results.forEach(server => {
        const { ipv4_address, port_number, referential_name, description } = server;
        console.log(`Server: ${referential_name} at ${ipv4_address}`);       
    })
    

    const rsListDiv = document.getElementById("rslist");
    rsListDiv.innerHTML = '';
        
    results.forEach(server => {
        console.log('about to destructure:', server);
        const { server_id, ipv4_address, port_number, referential_name, description } = server;
        console.log('destructured server_id:', server_id); 

        const newServer = document.createElement('div');
        newServer.className = 'server-item';// need to style this class
        newServer.id = ipv4_address
        newServer.innerHTML = (`
            <h3>Name: ${referential_name}</h3>
            <ul>
                <li>Ip address: ${ipv4_address}</li>
                <li>Description: ${description}</li>
            </ul>
            <button class="btn delete-btn">Delete Server</button>
            <button class="btn scan-btn" class="btn">Manage Containers</button>
        `);

        const rsListDiv = document.getElementById("rslist");
        const deleteBtn = newServer.querySelector('.delete-btn');
        const scanBtn = newServer.querySelector('.scan-btn');


        deleteBtn.addEventListener('click', () => deleteServer(ipv4_address));
        scanBtn.addEventListener('click', () => getServerCreds(server_id));

        rsListDiv.appendChild(newServer);

    });    
};


const collapseServerList = () => {
    const rsListDiv = document.getElementById("rslist");
    rsListDiv.innerHTML = ('');
};

document.addEventListener('DOMContentLoaded', () => {
    const collapseListBtn = document.querySelector("#collapseListBtn");
    const rsListDiv = document.getElementById("rslist");

    if(collapseListBtn){
        collapseListBtn.addEventListener('click', collapseServerList);
    };
});


//event listener 
document.addEventListener('DOMContentLoaded', () => {
    const remoteListBtn = document.querySelector("#remoteListBtn");
    if(remoteListBtn) {
        remoteListBtn.addEventListener('click', fetchAllServers);
    }
});

let config = {};

const sshForm = document.querySelector("#ssh-form");

sshForm.addEventListener('submit', async (event) =>{
    event.preventDefault();
    
    const host = document.querySelector("#host").value;
    const port = document.querySelector("#port").value;
    const username = document.querySelector("#username").value;
    const command = document.querySelector("#command").value;
    const password = document.querySelector("#password").value;
    const sshResults = document.querySelector("#stdoutDiv");

    const portInt = parseInt(port);

    console.log(`port: ${portInt} Object type ${typeof(portInt)}`);
    
    let config = { host, portInt, username, password }

    console.log(config);
     
    console.log(host);
    console.log(typeof(host));

    try{

        const result = await window.electronAPI.ssh.sshConnectExec(config, command);
        console.log('SSH result:', result);
        sshResults.innerHTML = (`<p>${result}</p>`);
    }catch(err){
        console.error('SSH error:', err)
    }
    
})

remoteInsertForm.addEventListener('submit', async(event) => {
    event.preventDefault();

    const ipv4_address = document.querySelector("#ipAddr").value;
    const port_number = document.querySelector("#portNumber").value;
    const referential_name = document.querySelector("#refName").value;
    const description = document.querySelector("#descrip").value;
    const username = document.querySelector("#usernameAddServer").value;
    const password = document.querySelector("#passwordAddServer").value;
    const remoteList = document.querySelector("#remoteList");

    console.log('username is:', username);

    console.log('password is:', password);

    let remoteData = { ipv4_address, port_number, referential_name, description };

    console.log("remote data to be inserted into DB upon submission: ", remoteData);
   
    //insert into ssh credentials: {name, host, username, password, port, updated_at::default now() };
    
    const remoteListNotif = document.createElement('div');

    remoteListNotif.className = 'notif-card';

    try{
        const result = await window.electronAPI.db.insertRemoteServers(remoteData);
        console.log("data inserted into db:", result);

        let sshCredentials = { server_id: result.lastInsertRowid , ipv4_address, port_number, username, password};
        console.log(sshCredentials);
        
        

        const sshCredsResult = await window.electronAPI.db.saveCredentials(sshCredentials);
        console.log("data inserted into the ssh_credentials table", sshCredentials);
        console.log("data inserted successfully");
        
        remoteListNotif.innerHTML = (`
            <h2>Successfully added server:</h2>
            <ul>
                <li>ipv4 address: ${ipv4_address}</li>
                <li>Port: ${port_number}</li>
                <li>referential name: ${referential_name}</li>
                <li>description: ${description}</li>
            </ul>
            `);

        remoteList.appendChild(remoteListNotif); 

    }catch(err){
        console.error("Error in inserting data to database", err.message);
    }
});


