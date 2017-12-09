![Build Status](https://img.shields.io/travis/tonymet/knox-ec2-role.svg)
![Downloads](https://img.shields.io/npm/dm/knox-ec2-role.svg)
![Downloads](https://img.shields.io/npm/dt/knox-ec2-role.svg)
![npm version](https://img.shields.io/npm/v/knox-ec2-role.svg)
![dependencies](https://img.shields.io/david/tonymet/knox-ec2-role.svg)
![dev dependencies](https://img.shields.io/david/dev/tonymet/knox-ec2-role.svg)
![License](https://img.shields.io/npm/l/knox-ec2-role.svg)

# knox-ec2-role

Create a [Knox client](https://www.npmjs.com/package/knox) using ec2 instance role metadata. Great for removing credentials from github and/or chef databags

See [this guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html) which explains how to set up and use EC2 instance roles for your app.

[![build status](https://secure.travis-ci.org/tonymet/knox-ec2-role.svg)](http://travis-ci.org/tonymet/knox-ec2-role)
[![dependency status](https://david-dm.org/tonymet/knox-ec2-role.svg)](https://david-dm.org/tonymet/knox-ec2-role)

## Installation

```
npm install --save knox-ec2-role
```

## Usage
```
var knoxec2 = require('knox-ec2-role')
knoxec2.authenticate({bucket: 'my-bucket'})
  .then(function(client){
    var req = client.put('/test/obj.json', {
      'Content-Type': 'application/json'
    })
    req.on('response', function(res){
      if (200 == res.statusCode) {
        console.log('saved to %s', req.url);
      }
    }
    req.end(JSON.stringify({foo: 'bar'}))
  })
  .catch(function(e){
    console.log('error fetching metadata:' + e)
  });
```

## Credits
[Tony Metzidis](https://github.com/tonymet/)
