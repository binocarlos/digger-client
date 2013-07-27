digger-client
=============

A bundle of digger-* modules that works well as a basic client for digger.io warehouses

## example

```js

var Client = require('digger-client');

// pass the [supplychain](https://github.com/binocarlos/digger-supplychain) handler function into the constructor
var $digger = Client(function(req, reply){
	// this deals with passing the request back to a warehouse to be dealt with
	warehouse(req, reply);
})

// get a root container
var container = $digger.connect('/db1');

// run a selector
container('some.selector').ship(function(results){
	
	// digger-find is included so we can search local results
	console.log(results.find('#thing3').summary());
})

```

## licence
MIT