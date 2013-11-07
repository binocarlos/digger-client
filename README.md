digger-client
=============

A bundle of digger-* modules that is used as the generic $digger network client.

 * [digger-container](https://github.com/binocarlos/digger-container) - wrapper for model data
 * [digger-find](https://github.com/binocarlos/digger-find) - searches local models
 * [digger-selector](https://github.com/binocarlos/digger-selector) - parses selectors into query objects
 * [digger-contracts](https://github.com/binocarlos/digger-contracts) - create HTTP request objects from containers
 * [digger-supplychain](https://github.com/binocarlos/digger-supplychain) - connect to external locations to run requests
 * [digger-utils](https://github.com/binocarlos/digger-utils) - general shared util functions


## usage

You create a client by passing a [digger-supplychain](https://github.com/binocarlos/digger-supplychain) handler function.

This function accepts the request object and reply callback.

```js

var Client = require('digger-client');

var $digger = Client(function(req, reply){
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