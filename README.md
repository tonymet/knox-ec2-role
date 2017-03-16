# knox-ec2-role

Create Knox client via ec2 instance role metadata

[![build status](https://secure.travis-ci.org/tonymet/knox-ec2-role.svg)](http://travis-ci.org/tonymet/knox-ec2-role)
[![dependency status](https://david-dm.org/tonymet/knox-ec2-role.svg)](https://david-dm.org/tonymet/knox-ec2-role)

## Installation

```
npm install --save knox-ec2-role
```

## Usage

```
var knoxec2 = require('knox-ec2-role')

defaultConf = {region: 'us-east-1'};

knoxec2.authenticate(defaultConf, {timeout: 5000})
  .then(function(client){
    debug('Access key id: ' + client.key);
    var object = { foo: "bar" };
    var string = JSON.stringify(object);
    var req = client.put('/test/obj.json', {
        'Content-Length': Buffer.byteLength(string)
      , 'Content-Type': 'application/json'
    });
    req.on('response', function(res){
      if (200 == res.statusCode) {
        console.log('saved to %s', req.url);
      }
    });
    req.end(string);
  })
  .catch(function(e){
    console.log('error fetching metatdata:' + e)
  });
```

## Credits
[Tony Metzidis](https://github.com/tonymet/)

## License

ISC
