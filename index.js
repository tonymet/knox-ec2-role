/*global Promise:true*/
var AWS = require('aws-sdk')
  , debug = require('debug')('knox-ec2-role')

var REFRESH_INTERVAL = 3 * 60 * 1000

function authenticate(knox, conf, httpOptions) {
  conf = conf || {}
  Object.assign(AWS.config.httpOptions, httpOptions)
  return new Promise(function (resolve, reject) {
    var metadataService = new AWS.MetadataService()
    , client
    metadataService.loadCredentials(function (err, creds) {
      if (err !== null) {
        return reject(err)
      }
      debug('conf', conf)
      debug('httpOptions', httpOptions)
      debug('credentials from aws: ', creds)
      Object.assign(conf, {key: creds.AccessKeyId, secret: creds.SecretAccessKey, token: creds.Token})
      // refresh creds periodically
      try {
        client = knox.createClient(conf)
        resolve(client)
        if(conf['knox-ec2-role'] && conf['knox-ec2-role'].refresh){
          setInterval(
            function(){
              refresh(client)
            }, REFRESH_INTERVAL)
        }
      } catch (e) {
        debug(e)
        debug(e.stack)
        reject(e)
      }
    })
  })
}

function refresh(client){
  return new Promise(function (resolve, reject) {
    var metadataService = new AWS.MetadataService()
    metadataService.loadCredentials(function (err, creds) {
      if (err !== null) {
        return reject(err)
      }
      debug('refresh credentials from aws: ', creds)
      Object.assign(client, {key: creds.AccessKeyId, secret: creds.SecretAccessKey, token: creds.Token})
      return resolve(client)
    })
  })
}

module.exports = {authenticate: authenticate, refresh: refresh}