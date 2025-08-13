const Database = require('better-sqlite3');
const path = require('path');
const app = require('electron');

let dbPath;
if(process.env.NODE_ENV === 'test') {
    dbPath = ':memory:';
}else{
    const { app } = require('electron');
    dbPath = path.join(app.getPath('userData'), 'gnosis-db');
}

const db = new Database(dbPath);

const initDB = () => {
    // MAKE SURE TO REMOVE THESE DROP STATMENTS!
    /*
    db.exec('drop table if exists users');
    db.exec('drop table if exists remote_servers');
    db.exec('DROP TABLE IF EXISTS ssh_credentials;');
    db.exec('drop table if exists docker_containers');
    db.exec('drop table if exists container_logs');
    */ 

    db.exec('PRAGMA foreign_keys = ON;');

    db.exec(`
        create table if not exists users (
            user_id integer primary key autoincrement,
            username text not null unique, 
            password text not null,
            first_name text not null,
            last_name text not null, 
            phone_number text not null,
            email_address text not null
        );   
        

        create table if not exists remote_servers (
            server_id integer primary key autoincrement,
            ipv4_address text not null,
            port_number text not null,
            referential_name text,
            description text
        );

        create table if not exists ssh_credentials (
            credentials_id integer primary key autoincrement,
            server_id integer not null,
            ipv4_address text not null,
            port_number integer default 22,
            username text not null,
            password text not null, 
            created_at datetime default current_timestamp,
            updated_at datetime default current_timestamp,
            foreign key (server_id) references remote_servers(server_id) on delete cascade
        );

        create table if not exists docker_containers (
            container_id integer primary key autoincrement, 
            server_id integer not null,
            container_name text not null, 
            image_path text not null,
            status text not null,
            created_at datetime default current_timestamp, 
            updated_at datetime default current_timestamp,
            foreign key (server_id) references remote_servers(server_id) on delete cascade
        );
    
        create table if not exists container_logs (
            container_log_id integer primary key autoincrement,
            container_id integer not null,
            server_id integer not null,
            container_log_contents text not null,
            log_date_time not null default current_timestamp,
            foreign key (container_id) references docker_containers(container_id) on delete cascade,
            foreign key (server_id) references remote_servers(server_id) on delete cascade
        );
    `);
    console.log('Database initialized');
};


// Insert into ssh_credentials
const saveCredentials = (credData) => {
    const { server_id, ipv4_address, port_number, username, password} = credData;

    const stmt = db.prepare(`
        insert or replace into ssh_credentials (server_id, ipv4_address, port_number, username, password)
        values (?, ?, ?, ?, ?)
`);
    return stmt.run( server_id, ipv4_address, port_number, username, password );
};


// get credentials by ipv4
const getCredentials = (ipv4_address) => {
    const stmt = db.prepare('select * from ssh_credentials where ipv4_address = ?');
    return stmt.get(ipv4_address);
};


//list all creds by ipv4 password-less
const listCredentials = (ipv4_address) => {
    const stmt = db.prepare('select * from ssh_credentials where ipv4_address = ?');
    return stmt.all()
};


//delete credentials by ipv4 and port number
const deleteCredentials = (ipv4_address, port) => {
    const stmt = db.prepare('delete from ssh_credentials where ipv4_address = ? and port = ?');
    return stmt.run(ipv4_address, port);
};

//insert into remote servers
const insertRemoteServers = (remoteData) => {
    const { ipv4_address, port_number, referential_name, description } = remoteData;
    const stmt = db.prepare(`Insert or replace into remote_servers (ipv4_address, port_number, referential_name, description)
                   values (?, ?, ?, ?)`)
    return stmt.run(ipv4_address, port_number, referential_name, description);
};

//get remote server by ipv4 address  
const getRemoteServer = (ipv4_address) => {
    const stmt = db.prepare(`select * from remote_servers where ipv4_address = ?`);
    return stmt.get(ipv4_address);
};

//list all remote servers managed by gnosis in the org 
const listRemoteServers = () => {
    const stmt = db.prepare(`select * from remote_servers`);
    return stmt.all();
};

//delete from remote servers 
const deleteRemoteServer = (ipv4_address) => {
    const stmt = db.prepare(`delete from remote_servers where ipv4_address = ?`);
    stmt.run(ipv4_address);
}

//insert into docker_containers 
const insertDockerContainer = (containerData) => {
    const { server_id, container_name, image_path, status } = containerData;
    const stmt = db.prepare(`
        insert or replace into docker_containers (server_id, container_name, image_path, status, created_at, updated_at)
        values(?, ?, ?, ?, current_timestamp, current_timestamp);
    `);

    stmt.run(server_id, container_name, image_path, status);
};

//get docker container by container name 
const getDockerContainer = (containerName) => {
    const stmt = db.prepare(`
        select * from docker_containers where container_name like ?;
    `)

    return stmt.get(`%${containerName}%`);
};

//get all docker containers for the org 
const listContainers = () => {
    const stmt = db.prepare(`select * from docker_containers`);
    return stmt.all();
};

//delete from docker containers 
const deleteContainer = (containerId) => {
    const stmt = db.prepare(`delete from docker_containers where container_id = ?`);
    return stmt.run(containerId);
};

//insert into container_logs 
const insertContainerLog = (logData) => {
    const { container_id, server_id, container_log_contents, log_date_time } = logData;
    const stmt = db.prepare(`
        insert or replace into container_logs(container_id, server_id, container_log_contents, log_date_time)
        values (?, ?, ?, current_timestamp);
        `)

    return stmt.run(logData);
};

//get container_logs for a specific container
const getContainerLog = (containerId) => {
    const stmt = db.prepare(`
        select * from container_logs where container_id = ?    
    `);

    return stmt.all(containerId);
};

// delete from container_logs 
const deleteContainerLog = (containerLogId) => {
    const stmt = db.prepare(`
        delete from container_logs where container_log_id = ?; 
    `)

    return stmt.run(containerLogId);
}

module.exports = {
    initDB, 
    saveCredentials,
    getCredentials,
    listCredentials,
    deleteCredentials,
    insertRemoteServers,
    getRemoteServer,
    listRemoteServers,
    deleteRemoteServer,
    insertDockerContainer,
    getDockerContainer,
    listContainers,
    deleteContainer, 
    insertContainerLog,
    getContainerLog,
    deleteContainerLog
};
