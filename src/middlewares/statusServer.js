const net = require('net');
const Promise = require('bluebird');

function checkConnection(host, port, timeout) {
  return new Promise(function (resolve, reject) {
    timeout = timeout || 10000; // default of 10 seconds
    const timer = setTimeout(function () {
      reject('timeout');
      socket.end();
    }, timeout);
    const socket = net.createConnection(port, host, function () {
      clearTimeout(timer);
      resolve();
      socket.end();
    });
    socket.on('error', function (err) {
      clearTimeout(timer);
      reject(err);
    });
  });
}

module.exports = checkConnection;
