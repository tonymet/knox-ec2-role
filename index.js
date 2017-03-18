var AWS = require('aws-sdk')
  , debug = require('debug')('knox-ec2-role')
  , knox = require('knox')

module.exports = {
  authenticate: function (conf, httpOptions) {
    conf = conf || {}
    var metadata = new AWS.MetadataService()
    Object.assign(AWS.config.httpOptions, httpOptions)
    return metadata.loadCredentials().promise()
      .then(function (creds) {
        debug('loading credentials from aws metadata')
        debug(creds)
        Object.assign(conf, {key: creds.AccessKeyId, secret: creds.SecretAccessKey, token: creds.Token})
        try {
          var client = knox.createClient(conf)
          return Promise.resolve(client)
        } catch (e) {
          return Promise.reject(e)
        }
      })
  }
}
