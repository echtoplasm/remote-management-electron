process.env.NODE_ENV = 'test';

const db = require('../../main/services/dbManager.js');

describe('Database Operations', () => {

    beforeEach(() => {
        db.initDB();
    });
    
    test('should save and retrieve credentials', () => {
        const testCreds = {name: 'test', host:'localhost', username: 'user', password: 'pass'};
        db.saveCredentials(testCreds);
        const retrieved = db.getCredentials('test');
        expect(retrieved.name).toBe('test');
    });

    test('should insert and retrieve remote server', () => {
        const testRemoteData = {ipv4_address: '127.0.0.1', port_number: '22', referential_name: 'test_name', description: 'this is a test'};
        db.insertRemoteServers(testRemoteData);
        const retrievedRemote = db.getRemoteServer('127.0.0.1');
        expect(retrievedRemote.ipv4_address).toBe('127.0.0.1');
    });

    test('should insert and retrieve remote server and docker container, to check fk constraint', () => {
        const testRemoteData = {ipv4_address: '127.0.0.1', port_number: '22', referential_name: 'test_name', description: 'this is a test'};
        db.insertRemoteServers(testRemoteData);
        const retrievedRemote = db.getRemoteServer('127.0.0.1');
        
        console.log(`Retrieved remote server: ${retrievedRemote.referential_name} server_id: ${retrievedRemote.server_id}`);
        
        expect(retrievedRemote.server_id).toBe(1);

        const testContainerData = {server_id: 1, container_name: "test container name", image_path: "nginx", status: "running"};
        db.insertDockerContainer(testContainerData);
        const retrievedContainer = db.getDockerContainer("test container name");
        
        expect(retrievedContainer.server_id).toBe(1);

    });
});
