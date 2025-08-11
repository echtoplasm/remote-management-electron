// fetch all servers being managed
const fetchAllServers = async () => {
    const results = await window.electronAPI.db.listRemoteServers();
    console.log(results);

    results.forEach(server => {
        const { ipv4_address, port_number, referential_name, description } = server;
        console.log(`Server: ${referential_name} at ${ipv4_address}`);       
    })

    /* USE THE array.map method to rendering the server on the UI */
    
    const rsListDiv = document.getElementById("rslist");

    rsListDiv.innerHTML = '';
        
    results.forEach(server => {
        const { ipv4_address, port_number, referential_name, description } = server;
        const newServer = document.createElement('div');
        newServer.className = 'server-item';
        newServer.innerHTML = (`
            <h3>Name: ${referential_name}</h3>
            <ul>
                <li>Ip address: ${ipv4_address}</li>
                <li>Description: ${description}</li>
            </ul>
        `);

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

    const remoteList = document.querySelector("#remoteList");

    let remoteData = { ipv4_address, port_number, referential_name, description };

    console.log("remote data ot be inserted into DB upon submission: ", remoteData);
    
    try{
        
        const result = await window.electronAPI.db.insertRemoteServers(remoteData);
        console.log("data inserted into db:", result);
        console.log("data inserted successfully");
        
        remoteList.innerHTML = (`
            <p>Successfully added server:</p>
            <ul>
                <li>ipv4 address: ${result.ipv4_address}</li>
                <li>Port: ${result.port_number}</li>
                <li>referential name: ${result.referential_name}</li>
                <li>description: ${result.description}</li>
            </ul>
            `);

    }catch(err){
        console.error("Error in inserting data to database", err.message);
    }
});

