const loadScanResults = async () => {
    const scanResults = await window.electronAPI.nav.getScanResults();
    console.log(`SCAN RESULTS:::: ${scanResults}`);
} ;

loadScanResults();


