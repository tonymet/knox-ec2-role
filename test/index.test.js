'use strict'
var chai = require('chai')
, expect = chai.expect
, proxyquire = require('proxyquire')
, AWS = require('aws-sdk-mock')
chai.use(require('chai-as-promised'))

describe('uploading files', function () {
  let knoxec2
  before(function () {
    AWS.mock('MetadataService', 'loadCredentials', function (callback) {
      callback(null, {AccessKeyId: process.env.ACCESS_KEY_ID
        , SecretAccessKey: process.env.SECRET_ACCESS_KEY})
    })
    knoxec2 = proxyquire('../index.js', { 'AWS': AWS })
  })
  after(function () {
    knoxec2 = null
    AWS.restore('MetadataService')
  })
  it('should upload file', function (done) {
    knoxec2.authenticate({bucket: process.env.K2_BUCKET}, {timeout: 5000})
      .then(function (client) {
        var object = { foo: 'bar' }
        , string = JSON.stringify(object)
        , req = client.put('/test/obj.json', {
            'Content-Length': Buffer.byteLength(string)
          , 'Content-Type': 'application/json'
        })
        req.on('response', function (res) {
          expect(res.statusCode).to.equal(200)
          done()
        })
        req.end(string)
      })
  })
  it('should fail to upload with a bad bucket', function (done) {
    knoxec2.authenticate({bucket: process.env.K2_BUCKET + 'xxx'}, {timeout: 5000})
      .then(function (client) {
        var object = { foo: 'bar' }
        , string = JSON.stringify(object)
        , req = client.put('/test/obj.json', {
            'Content-Length': Buffer.byteLength(string)
          , 'Content-Type': 'application/json'
        })
        req.on('response', function (res) {
          expect(res.statusCode).to.equal(404)
          done()
        })
        req.end(string)
      })
  })
})

describe('failed metadata test', function () {
  let knoxec2
  before(function () {
    AWS.mock('MetadataService', 'loadCredentials', function (callback) {
      // force error
      callback(true)
    })
    knoxec2 = proxyquire('../index.js', { 'AWS': AWS })
  })
  after(function () {
    knoxec2 = null
    AWS.restore('MetadataService')
  })
  it('should reject a broken promise', function () {
    return expect(knoxec2.authenticate({bucket: process.env.K2_BUCKET}, {timeout: 5000})).to.be.rejected
  })
})
