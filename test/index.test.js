/*eslint promise/no-callback-in-promise:off*/
'use strict'
var chai = require('chai')
, expect = chai.expect
, debug = require('debug')('index.test.js')
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
  var knoxec2
  before(function () {
    AWS.mock('MetadataService', 'loadCredentials', function (callback) {
      callback(null, {AccessKeyId: process.env.AWS_ACCESS_KEY_ID
        , SecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY})
    })
    knoxec2 = proxyquire('../index.js', { 'AWS': AWS })
  })
  after(function () {
    knoxec2 = null
    AWS.restore()
  })
  it('should upload file', function (done) {
    knoxec2.authenticate({bucket: process.env.K2_BUCKET})
      .then(testUpload(function (res) {
        expect(res.statusCode).to.equal(200)
        done()
      }))
      .catch(function(){})
  })
  it('should fail to upload with a bad bucket', function (done) {
    knoxec2.authenticate({bucket: process.env.K2_BUCKET + 'xxx'})
      .then(testUpload(function (res) {
        expect(res.statusCode).to.equal(404)
        done()
      }))
      .catch(function(){})
  })
  it('should work without httpOptions', function (done) {
    knoxec2.authenticate({bucket: process.env.K2_BUCKET})
      .then(function (client) {
        expect(client).to.be.an.object
        return done()
      })
      .catch(function(){})
  })
  it('should reject when a bucket is not specified', function () {
    return expect(knoxec2.authenticate({})).to.be.rejectedWith('aws "bucket" required')
  })
})

describe('failed metadata test', function () {
  var knoxec2
  before(function () {
    // disable due to unhandled rejection
    this.skip()
    AWS.mock('MetadataService', 'loadCredentials', function (callback) {
      debug('mocking failure')
      callback(true, {})
    })
    knoxec2 = proxyquire('../index.js', { 'AWS': AWS })
  })
  after(function () {
    knoxec2 = null
    AWS.restore()
  })
  it('should reject when MetadataService returns error', function () {
    return expect(knoxec2.authenticate({bucket: process.env.K2_BUCKET})).to.be.rejected
  })
  /*
  it('should reject when MetadataService returns error', function (done) {
    knoxec2.authenticate({bucket: process.env.K2_BUCKET}).catch(function (err) {
      expect(err).to.equal('kaka')
      done()
    })
  })
  */
})

describe('metadata returns bad key', function () {
  var knoxec2
  before(function () {
    AWS.mock('MetadataService', 'loadCredentials', function (callback) {
      callback(null, {AccessKeyId: null
        , SecretAccessKey: null})
    })
    knoxec2 = proxyquire('../index.js', { 'AWS': AWS })
  })
  after(function () {
    knoxec2 = null
    AWS.restore()
  })
  it('should reject a broken promise', function () {
    return expect(knoxec2.authenticate({bucket: process.env.K2_BUCKET})).to.be.rejected
  })
})

