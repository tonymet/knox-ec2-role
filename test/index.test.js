'use strict'
var chai = require('chai')
, expect = chai.expect
, proxyquire = require('proxyquire')
, AWS = require('aws-sdk-mock')
chai.use(require('chai-as-promised'))

function testUpload (cb) {
    return function (client) {
      var req = client.put('/test/obj.json', {
        'Content-Type': 'application/json'
      })
      req.on('response', cb)
      req.end(JSON.stringify({foo: 'bar2'}))
    }
}

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
    knoxec2.authenticate({bucket: process.env.K2_BUCKET})
      .then(testUpload(function (res) {
        expect(res.statusCode).to.equal(200)
        done()
      }))
  })
  it('should fail to upload with a bad bucket', function (done) {
    knoxec2.authenticate({bucket: process.env.K2_BUCKET + 'xxx'})
      .then(testUpload(function (res) {
        expect(res.statusCode).to.equal(404)
        done()
      }))
  })
  it('should work without httpOptions', function (done) {
    knoxec2.authenticate({bucket: process.env.K2_BUCKET})
      .then(function (client) {
        expect(client).to.be.an.object
        done()
      })
  })
  it('should reject when a bucket is not specified', function () {
      return expect(knoxec2.authenticate({})).to.be.rejectedWith('aws "bucket" required')
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
    return expect(knoxec2.authenticate({bucket: process.env.K2_BUCKET})).to.be.rejected
  })
})

describe('metadata returns bad key', function () {
  let knoxec2
  before(function () {
    AWS.mock('MetadataService', 'loadCredentials', function (callback) {
      callback(null, {AccessKeyId: null
        , SecretAccessKey: null})
    })
    knoxec2 = proxyquire('../index.js', { 'AWS': AWS })
  })
  after(function () {
    knoxec2 = null
    AWS.restore('MetadataService')
  })
  it('should reject a broken promise', function () {
    return expect(knoxec2.authenticate({bucket: process.env.K2_BUCKET})).to.be.rejected
  })
})
