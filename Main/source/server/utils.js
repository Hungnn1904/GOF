const os = require('os');

function makeId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function findLocalIp() {
  const interfaces = os.networkInterfaces();
  let preferredIp = null;
  let fallbackIp = null;

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family !== 'IPv4' || iface.internal) {
        continue;
      }
      if (iface.address.startsWith('10.') || iface.address.startsWith('192.168.')) {
        preferredIp = iface.address;
        break;
      }
      if (fallbackIp === null) {
        fallbackIp = iface.address;
      }
    }
    if (preferredIp) break;
  }
  return preferredIp || fallbackIp || 'localhost';
}

module.exports = { makeId, findLocalIp };
