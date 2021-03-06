'use strict';

var PS = require('../app.js');
var H = require('highland');

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;

var hosts = [
  'http://www.google.com',
  'http://www.startpage.com',
  'http://www.yahoo.com',
];

describe('promise-stream', () => {

  it('should get one host using a promise', () => {
    return PS.ping(hosts[0])
        .then(statusCode => {
          console.log(statusCode);
          return expect(statusCode).to.equal(200);
        });
  });

  it('should get one host using a stream of a single object', (done) => {
    var statusCodes = [];

    var stream = H(PS.ping(hosts[1]))
        .each(code => statusCodes.push(code));

    stream.done(() => {
      console.log(statusCodes);
      done();
    });
  });

  it('should receive a http 200 statuscode from three hosts using highland consume', (done) => {
    var statusCodes = [];

    H(hosts).consume((err, host, push, next) => {
      if (err) console.log(err);

      if (host === H.nil) {
        push(null, host);
      } else {
        console.log('host:', host);
        PS.ping(host).then(statusCode => {
          push(null, statusCode);
          next();
        });
      }
    }).toArray((items) => {
      console.log(items);
      expect(items).to.deep.equal([200, 200, 200]);
      done();
    });

  });

  it('should receive 200 status codes for the hosts array using highland sequence', (done) => {

    H(hosts).map(host => {
      return H(PS.ping(host));
    }).sequence()
    .toArray(result => {
      console.log(result);
      expect(result).to.deep.equal([200, 200, 200]);
      done();
    });

  });

  it('should receive 200 status codes for the hosts array using highland parallel', (done) => {

    H(hosts).map(host => {
      return H(PS.ping(host));
    }).parallel(10)
    .toArray(result => {
      console.log(result);
      expect(result).to.deep.equal([200, 200, 200]);
      done();
    });

  });

});
