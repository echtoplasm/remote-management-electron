const insertDockerContainer = async (containerData, button) => {
    //server_id, container_name, image_path, status 
    button.innerHTML = 'adding...';
    button.disabled = true;

    try{
        const insertResult = await window.electronAPI.db.insertDockerContainer(containerData);
        button.innerHTML = 'added ✔'
        button.style.backgroundColor = '#4CAF50';
        button.style.color = 'white';
    }catch(err){
        console.error('Failed to add container', err);
        button.innerHTML = 'Error ❌'
        button.style.backgroundColor = '#f44336';
        button.style.color = 'white';
    }

}


const scanForContainers = async (credentials, serverId) => {
    try{
        const scanResults = await window.electronAPI.docker.dockerPs(credentials.ipv4_address, 
                                                                 credentials.port_number,
                                                                 credentials.username, 
                                                                 credentials.password)
        console.log('scan results:', scanResults);
        console.log(`Type of:: scan results::`, typeof(scanResults))
        console.log(`ITS ALIVE! 🧟‍♂️🔬 DOCKER SCAN ON ${credentials.ipv4_address} SUCCESSFUL`);
        
                
        const dockerScanModal = document.createElement('div');
        dockerScanModal.className = 'notif-card';
        dockerScanModal.id = 'dockerScanResults';
        
        dockerScanModal.innerHTML = (`<h3>Docker Containers on ${credentials.ipv4_address}</h3>`);
        
        scanResults.forEach((container, index) => {
            
            const {ID, Names, Image, State, Status } = container;


            const containerItem = document.createElement('div');
            containerItem.className = 'container-item';
            containerItem.id = ID;
            
            const buttonId = `container-add-${ID}`

            containerItem.innerHTML = (
                `
                <div>
                    <ul>
                        <li>Server Id: ${serverId}</li>
                        <li>Container Name: ${Names}</li>
                        <li>Image: ${Image}</li>
                        <li>Status: ${Status}</li>
                    </ul>
                    <button class="btn container-add-btn">Add to gnosis</button>
                </div>
                `
        );
       
            
            dockerScanModal.appendChild(containerItem);
            
            const containerData = { "server_id": serverId,
                                    "container_name": Names, 
                                    "image_path": Image, 
                                    "state": State, 
                                    "status": Status 
                                    };


            const addContainerBtn = containerItem.querySelector('.container-add-btn');
            addContainerBtn.addEventListener('click', () => insertDockerContainer(containerData, addContainerBtn));
        });
        
        const contentContainer = document.getElementById("content-container");
        contentContainer.prepend(dockerScanModal);

        
 
    }catch(err){
        console.error('unable to open modal', err.message);
        console.error('Full error:', err)
    }
};


//method to close notification cards, pass value as string 
const closeNotif = async (id) => {
    const notif = document.getElementById(id);   
    console.log(notif); 
    if(notif){
        notif.remove();
    }
}


//getting server credentials to pass to dockerPs
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
    dockerScan.addEventListener('click', () => scanForContainers(creds, serverId));
    
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
        scanBtn.addEventListener('click', async () => { 
           scanBtn.disable = true;
            try {
                await getServerCreds(server_id);
            } catch(err) {
                console.error('Failed to get server credentials', err.message);
            } finally {
                scanBtn.disabled = false;
            }
        });

        rsListDiv.appendChild(newServer);

    });    
};

//collapse server list method
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


//event listener to fetch all servers  
document.addEventListener('DOMContentLoaded', () => {
    const remoteListBtn = document.querySelector("#remoteListBtn");
    if(remoteListBtn) {
        remoteListBtn.addEventListener('click', fetchAllServers);
    }
});



//Simple gui for RCE
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


