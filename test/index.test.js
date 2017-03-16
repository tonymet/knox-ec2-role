var knoxec2 = require('../index.js')
, chai = require('chai')
, expect = chai.expect

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
        console.log('error fetching metatdata:' + e)
        done()
      })
  })

})
