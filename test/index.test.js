/*eslint promise/no-callback-in-promise:off*/
'use strict'
var chai = require('chai')
chai.use(require('chai-as-promised'))
var debug = require('debug')('index.test.js')
, AWS = require('aws-sdk-mock')
, expect = chai.expect

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
  beforeEach(function () {
    AWS.mock('MetadataService', 'loadCredentials', function (callback) {
      callback(null, {AccessKeyId: process.env.AWS_ACCESS_KEY_ID
        , SecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY})
    } )
    knoxec2 = require('../')
  })
  afterEach(function () {
    knoxec2 = null
    AWS.restore()
  })
  it('should upload file', function (done) {
    knoxec2.authenticate({bucket: process.env.K2_BUCKET})
      .then(testUpload(function (res) {
        expect(res.statusCode).to.equal(200)
        done()
      }))
      .catch(done)
  })
  it('should fail to upload with a bad bucket', function (done) {
    knoxec2.authenticate({bucket: process.env.K2_BUCKET + 'xxx'})
      .then(testUpload(function (res) {
        expect(res.statusCode).to.equal(404)
        done()
      }))
      .catch(done)
  })
  it('should work without httpOptions', function (done) {
    knoxec2.authenticate({bucket: process.env.K2_BUCKET})
      .then(function(client) {
        expect(client).to.have.property('options')
        done()
      })
      .catch(done)
  })
  it('should reject when a bucket is not specified', function () {
    return expect(knoxec2.authenticate({key: 'fdsaf', secret: 'fdasf'})).to.be.rejectedWith('aws "bucket" required')
  })
})

describe('failed metadata test', function () {
  var knoxec2
  before(function () {
    AWS.mock('MetadataService', 'loadCredentials', function (callback) {
      debug('mocking failure')
      callback('intentional error', {})
    })
    knoxec2 = require('../')
  })
  after(function () {
    knoxec2 = null
    AWS.restore()
  })
  it('should reject when MetadataService returns error', function (done) {
    expect(knoxec2.authenticate({bucket: process.env.K2_BUCKET})).to.be.rejected.notify(done)
  })
})

describe('metadata returns bad key', function () {
  var knoxec2
  before(function () {
    AWS.mock('MetadataService', 'loadCredentials', function (callback) {
      callback(null, {AccessKeyId: null
        , SecretAccessKey: null})
    })
    knoxec2 = require('../')
  })
  after(function () {
    knoxec2 = null
    AWS.restore()
  })
  it('should reject a broken promise', function () {
    return expect(knoxec2.authenticate({bucket: process.env.K2_BUCKET})).to.be.rejected
  })
})
