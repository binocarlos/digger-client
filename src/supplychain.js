var EventEmitter = require('events').EventEmitter;
var utils = require('digger-utils');
var Container = require('digger-container');
var Contracts = require('digger-contracts');
var Find = require('digger-find');

var concat = require('concat-stream');
var through = require('through2');
var duplexer = require('reduplexer');

function augment_prototype(api){
  for(var prop in api){
    Container.prototype[prop] = api[prop];
  }
}

augment_prototype(Contracts);
augment_prototype(Find);

function SupplyChain(options){
  EventEmitter.call(this);

  this.basepath = options.basepath || '';
  this.options = options;
  this.utils = utils;
}

utils.inherits(SupplyChain, EventEmitter);

module.exports = SupplyChain;

SupplyChain.prototype.createContractStream = function(r){
  var self = this;

  // we write out request input to here
  var req = through.obj();

  req.method = r.method;
  req.url = r.url;
  req.headers = r.headers;

  // we read our results from here
  var res = through.obj();

  // the combo stream we return to the user
  var stream = duplexer(req, res, {
    objectMode: true
  });

  stream.req = req;
  stream.res = res;

  return stream;
}

// leave the body input up to the user
SupplyChain.prototype.stream = function(contract){
  var self = this;

  // a stream contract should not have a body
  // the body should be piped into this stream
  delete(contract.req.body);

  var stream = this.createContractStream({
    url:'/stream',
    method:'post',
    headers:{
      'x-digger-contract':contract.req
    }
  })

  self.emit('request', stream.req, stream.res);
  return stream;
}

SupplyChain.prototype.ship = function(contract, fn, errorfn){
	var self = this;

  var contractStream = this.createContractStream({
    url:'/ship',
    method:'post',
    headers:{
      'Content-Type':'application/json'
    }
  });

  contractStream.pipe(concat(function(models){
    if(contractStream.res.statusCode===500){
      contractStream.emit('error', models);
    }
    else{
      var container = self.create(models);
      contract.emit('success', container);
      contract.emit('complete', null, container);
      fn && fn(container);  
    }
    
  }))

  contractStream.on('error', function(error){
    contract.emit('failure', error);
    contract.emit('complete', error);
    errorfn && errorfn(error);
  })


  contract.stream = contractStream;

  self.emit('request', contractStream.req, contractStream.res);

  setTimeout(function(){
    contractStream.end(contract.req);  
  })
  
  
  return contract;
}

SupplyChain.prototype.connect = function(path){
	var container = Container('_supplychain', {
		_digger:{
			path:this.basepath + path
		}
	})
	container.supplychain = this;
	return container;
}

SupplyChain.prototype.create = function(tag, data){
  var container = Container(tag, data);
  container.supplychain = this;
  return container;
}