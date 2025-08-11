// Mock the entire electronAPI 
const { testDockerVersion } = require('../../renderer/js/docker.js');
global.confirm = jest.fn();
global.showOSSelection = jest.fn();


const mockElectronAPI = {
    ssh: {
        spawnSSHtunnel: jest.fn(),
        dockerCheck: jest.fn(),
        sshConnectExec: jest.fn(),
        installDockerForOS: jest.fn()
    },
    env: {
        LOCAL_PORT: '3000',
        REMOTE_PORT: '22',
        SSH_USER: 'testuser',
        SSH_HOST: 'testhost',
        SSH_PASSWORD: 'testpass'
    }
};

// Mock the global window object
global.window = {
    electronAPI: mockElectronAPI,
};

// Mock your OS selection function
const mockShowOSSelection = jest.fn();
global.showOSSelection = mockShowOSSelection;

describe('Docker Installation Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should install Docker when not present and user agrees', async () => {
        // Setup mocks
        mockElectronAPI.ssh.spawnSSHtunnel.mockResolvedValue('SSH connected');
        mockElectronAPI.ssh.dockerCheck.mockResolvedValue({ 
            dockerInstalled: false 
        });
        global.window.confirm.mockReturnValue(true); // User agrees
        mockShowOSSelection.mockResolvedValue('ubuntu');
        mockElectronAPI.ssh.installDockerForOS.mockResolvedValue({
            prereqs: 'sudo apt-get update',
            config: 'curl -fsSL https://download.docker.com/linux/ubuntu/gpg',
            command: 'sudo apt-get install docker-ce'
        });
        mockElectronAPI.ssh.sshConnectExec.mockResolvedValue('Command executed');

        // Import and run your function
        await testDockerVersion();

        // Assertions
        expect(mockElectronAPI.ssh.dockerCheck).toHaveBeenCalled();
        expect(global.window.confirm).toHaveBeenCalledWith(
            expect.stringContaining('Docker not installed')
        );
        expect(mockShowOSSelection).toHaveBeenCalled();
        expect(mockElectronAPI.ssh.sshConnectExec).toHaveBeenCalledTimes(3); // prereqs, config, command
    });

    test('should skip installation when Docker is already installed', async () => {
        mockElectronAPI.ssh.spawnSSHtunnel.mockResolvedValue('SSH connected');
        mockElectronAPI.ssh.dockerCheck.mockResolvedValue({ 
            dockerInstalled: true,
            version: 'Docker version 20.10.8'
        });

        await testDockerVersion();

        expect(global.window.confirm).not.toHaveBeenCalled();
        expect(mockElectronAPI.ssh.sshConnectExec).not.toHaveBeenCalled();
    });

    test('should handle user declining installation', async () => {
        mockElectronAPI.ssh.spawnSSHtunnel.mockResolvedValue('SSH connected');
        mockElectronAPI.ssh.dockerCheck.mockResolvedValue({ 
            dockerInstalled: false 
        });
        global.window.confirm.mockReturnValue(false); // User declines

        await testDockerVersion();

        expect(mockShowOSSelection).not.toHaveBeenCalled();
        expect(mockElectronAPI.ssh.sshConnectExec).not.toHaveBeenCalled();
    });

    test('should test different OS installations', async () => {
        const osTestCases = ['ubuntu', 'centos', 'debian', 'rhel'];
        
        for (const os of osTestCases) {
            jest.clearAllMocks();
            
            mockElectronAPI.ssh.spawnSSHtunnel.mockResolvedValue('SSH connected');
            mockElectronAPI.ssh.dockerCheck.mockResolvedValue({ dockerInstalled: false });
            global.window.confirm.mockReturnValue(true);
            mockShowOSSelection.mockResolvedValue(os);
            mockElectronAPI.ssh.sshConnectExec.mockResolvedValue('Success');

            await testDockerVersion();

            expect(mockElectronAPI.ssh.installDockerForOS).toHaveBeenCalledWith(os);
        }
    });
});
