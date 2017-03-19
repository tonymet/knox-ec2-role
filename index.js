/*global Promise:true*/
var AWS = require('aws-sdk')
  , debug = require('debug')('knox-ec2-role')
  , knox = require('knox')

module.exports = {
  authenticate: function (conf, httpOptions) {
    conf = conf || {}
    Object.assign(AWS.config.httpOptions, httpOptions)
    return new Promise(function (resolve, reject) {
      var metadataService = new AWS.MetadataService()
      metadataService.loadCredentials(function (err, creds) {
        if (err !== null) {
          return reject(err)
        }
        debug('credentials from aws: ', creds)
        Object.assign(conf, {key: creds.AccessKeyId, secret: creds.SecretAccessKey, token: creds.Token})
        try {
          return resolve(knox.createClient(conf))
        } catch (e) {
          debug(e)
          debug(e.stack)
          reject(e)
        }
      })
    })
  }
}
