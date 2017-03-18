var AWS = require('aws-sdk')
  , debug = require('debug')('knox-ec2-role')
  , knox = require('knox')
  , Promise = require('bluebird')

module.exports = {
  authenticate: function (conf, httpOptions) {
    return new Promise(function (resolve, reject) {
      if (!conf) {
        conf = {}
      }
      Object.assign(AWS.config.httpOptions, httpOptions)
      var metadata = new AWS.MetadataService()
      debug('loading credentials from aws metadata')
      metadata.loadCredentials(function (err, creds) {
        if (err) {
          debug('error: ', err)
          reject(err)
          return
        }
        debug(creds)
        Object.assign(conf, {key: creds.AccessKeyId, secret: creds.SecretAccessKey, token: creds.Token})
        try {
          var client = knox.createClient(conf)
          resolve(client)
        } catch (e) {
          debug(e)
          debug(e.stack)
          reject(e)
        }
      })
    })
  }
}
