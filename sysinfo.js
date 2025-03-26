const si = require('systeminformation');

console.log("sysinfo started");
// Get basic system information
si.system()
  .then(data => console.log('System Info:', data))
  .catch(error => console.error(error));

// Get CPU information
si.cpu()
  .then(data => console.log('CPU Info:', data))
  .catch(error => console.error(error));

// Get memory information
si.mem()
  .then(data => console.log('Memory Info:', data))
  .catch(error => console.error(error));

// Get disk information
si.diskLayout()
  .then(data => console.log('Disk Info:', data))
  .catch(error => console.error(error));

// Get network interfaces
si.networkInterfaces()
  .then(data => console.log('Network Interfaces:', data))
  .catch(error => console.error(error));

// Get operating system information
si.osInfo()
  .then(data => console.log('OS Info:', data))
  .catch(error => console.error(error));

si.getStaticData().then(data => {
    console.log('Static Data:', data);
    console.log('graphics: ', data.graphics);
    }
);