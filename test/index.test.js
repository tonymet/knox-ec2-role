var chai = require('chai')
, expect = chai.expect
, proxyquire = require('proxyquire')
, AWS = require('aws-sdk-mock')
, knoxec2

AWS.mock('MetadataService', 'loadCredentials', function (callback) {
  callback(null, {AccessKeyId: process.env.ACCESS_KEY_ID
    , SecretAccessKey: process.env.SECRET_ACCESS_KEY})
})
knoxec2 = proxyquire('../index.js', { 'AWS': AWS })

describe('knox-ec2-role', function () {
  it('should upload file', function (done) {
    var defaultConf = {bucket: process.env.K2_BUCKET}
    knoxec2.authenticate(defaultConf, {timeout: 5000})
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
      .catch(function (e) {
        expect(e).to.not.be.true
        done()
      })
  })
})
