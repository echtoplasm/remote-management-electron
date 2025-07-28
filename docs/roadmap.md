# Future Plans #

## Database Integration ##
- Setting up a database connection with SQLite for releasing smaller binaries compared to postgres

## SSH handling ##
- Make the UX of the SSH handling much more intuitive such as including
    - including adding buttons for connecting where the credentials will be stored in the Database
    - adding buttons or dropdown list for using wellknown ssh commands (i.e. uptime etc.) 
    - offering an optional input for custom commands
- Enable portforwarding to tunnel websockets through SSH
    - This will allow for encrypted traffic through websockets via the SSH connection 
    - Allows the bypass of strict firewall rules 



## CVE Detection ##
The thought behind CVe detection in the context of this project is to allow the program to analyze 
package dependencies in docker images, pip, or npm for CVE's and report back the findings to the user

- Integrate with an external CVE API rather than storing CVE's in the bundled DB to avoid large bundle size
