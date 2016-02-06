'use strict';

var H = require('highland');
var Promise = require('bluebird');
var request = require('request');

module.exports = {
  queryHosts: queryHosts,
  ping: ping,
};

function queryHosts(hosts) {
  var statusCodes = [];

  var hostsStream = H(hosts)
      .map(host => H(ping(host)))
      .merge();
  hostsStream.sequence();
  hostsStream.done(() => new Promise.resolve(statusCodes));
}

function ping(host) {
  return new Promise((resolve, reject) => {
    request.get(host, (error, response, body) => {
      if (error) reject(error);
      console.log(host, 'said:', response.statusCode);
      resolve(response.statusCode);
    });
  });
}

