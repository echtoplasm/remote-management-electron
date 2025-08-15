const createNavigation = () => {
    const nav = document.createElement('nav');
    nav.id = 'navbar';
    nav.innerHTML = `
        <a href="#" class="nav-link" onclick="navigateTo('index.html')">Dashboard</a>
        <a href="#" class="nav-link" onclick="navigateTo('sysSpecs.html')">System Specs</a>
        <a href="#" class="nav-link" onclick="navigateTo('remote.html')">Remote Servers</a>
        <a href="#" class="nav-link" onclick="navigateTo(' docker.html')">Docker</a>
    `;
    document.body.insertAdjacentElement('afterbegin', nav);
}

const navigateTo = (page) => {
    window.electronAPI.nav.navigate(page);
}

document.addEventListener('DOMContentLoaded', createNavigation);
