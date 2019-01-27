/*eslint promise/no-callback-in-promise:off*/
'use strict'
var chai = require('chai')
chai.use(require('chai-as-promised'))
var debug = require('debug')('index.test.js')
, AWS = require('aws-sdk-mock')
, knox = require('knox')
, expect = chai.expect

function testUpload (client) {
  return new Promise(function(resolve) {
    var req = client.put('/test/obj.json', {
      'Content-Type': 'application/json'
    })
    req.on('response', resolve)
    req.end(JSON.stringify({foo: 'bar2'}))
  })
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
  it('should upload file', function () {
    return expect(knoxec2.authenticate(knox, {bucket: process.env.K2_BUCKET}).then(testUpload))
      .to.eventually.have.property('statusCode', 200)
  })
  it('should fail to upload with a bad bucket', function () {
    return expect(knoxec2.authenticate(knox, {bucket: process.env.K2_BUCKET + 'xxx'}).then(testUpload))
      .to.eventually.have.property('statusCode', 404)
  })
  it('should work without httpOptions', function () {
    return expect(knoxec2.authenticate(knox, {bucket: process.env.K2_BUCKET})).to.eventually.have.property('options')
  })
  it('should reject when a bucket is not specified', function () {
    return expect(knoxec2.authenticate(knox, {key: 'fdsaf', secret: 'fdasf'})).to.be.rejectedWith('aws "bucket" required')
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
  it('should reject when MetadataService returns error', function () {
    return expect(knoxec2.authenticate(knox, {bucket: process.env.K2_BUCKET})).to.be.rejected
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
    return expect(knoxec2.authenticate(knox, {bucket: process.env.K2_BUCKET})).to.be.rejected
  })
})
