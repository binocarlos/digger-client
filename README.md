digger-client
=============

![Build status](https://api.travis-ci.org/binocarlos/digger-client.png)

Client for a [digger](https://github.com/binocarlos/digger) network.

Combines [digger-bundle](https://github.com/binocarlos/digger-bundle) with [digger-supplychain](https://github.com/binocarlos/digger-supplychain)

## install

```
$ npm install digger-client
```

## usage

The module returns a supplychain object that emits the following events:

 * request
 * radio:talk
 * radio:listen
 * radio:cancel

You 'connect' to get a container that is pointing at a warehouse path:

```js
var Client = require('digger-client');

var $digger = Client();

$digger.on('request', function(req, reply){
	// deal with the request somehow
})

// connect to the supplychain - this returns a container with _digger.diggerurl = '/db1'
var container = $digger.connect('/db1');

// run a selector via the container - this runs the request to the supplychain above
container('some.selector').ship(function(results){
	
	// digger-find is included so we can search local results
	console.log(results.find('#thing3').summary());
})
```

## licence
MIT