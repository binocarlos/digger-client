digger-client
=============

Connect to a digger server and run selectors

## installation

```
$ npm install digger-client
```

## usage

First you must create a client and connect it to a transport.

The client provides you with the $digger api.

The transport is what moves the requests to the server.

```js
var supplychain = require('digger-client')();

// the transport is how we can messages from the client to the server
// this can be a network transport or a local stream based one
var transport = function(req, res){
	// req is a readable stream
	// res is a writable stream

	// deal with the request here - probably pass it off to a HTTP proxy
	// or a local digger server
}

// hook up the transport to the supplychain
supplychain.on('request', transport);
```

Now we have a supplychain hooked up to a transport - we can create containers:

```js
// connect to a warehouse on a path
var warehouse = supplychain.connect('/my/warehouse');

// run a selector to that warehouse
warehouse('product[price<100]').ship(function(products){
	console.log(products.count() + ' products loaded');
})
```

## licence
MIT