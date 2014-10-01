digger-client
=============

Connect to a digger server and run selectors

## installation

```
$ npm install digger-client
```

## usage

```js
// the supplychain is what connects our digger client with the transport
var supplychain = require('digger-client')();

// the transport is a function that handles the request and response streams
// this can move them over a network or pass them to a local digger server
supplychain.on('request', function(req, res){
	// req is a readable stream
	// res is a writable stream
})
```

Or make a HTTP connected client:

```js
var supplychain = require('digger-client').http('http://localhost:8080/digger');
```

Now we have a supplychain hooked up to a transport - we can create containers:

```js
// connect to a warehouse on a path
var warehouse = supplychain.connect('/my/warehouse');
```

ship requests can send complicated contracts with multiple inputs but cannot stream

they collect all the results into an array and pass them to your callback:

```js
// run a selector to that warehouse
warehouse('product[price<100]')
	.ship(function(products){
		console.log(products.count() + ' products loaded');
	})
```

stream requests can send only one source of input but can stream

```js
warehouse('product[price<100]')
	.stream()
	.through(function(model){
		console.dir(model);
	})

```

## licence
MIT