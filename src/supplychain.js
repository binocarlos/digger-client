var EventEmitter = require('events').EventEmitter;
var utils = require('digger-utils');
var Container = require('digger-container');
var Contracts = require('digger-contracts');
var Find = require('digger-find');
var concat = require('concat-stream');
var through = require('through');
var duplexer = require('duplexer');

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
  var req = through();

  req.method = r.method;
  req.url = r.url;
  req.headers = r.headers;

  // we read our results from here
  var res = through();

  // the combo stream we return to the user
  var stream = duplexer(req, res);

  stream.req = req;
  stream.res = res;

  self.emit('request', req, res);

  return stream;
}

// leave the body input up to the user
SupplyChain.prototype.stream = function(contract){
  var self = this;
  delete(contract.req.body);
  return this.createContractStream(contract.req);
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
      contract.emit('success', models);
      contract.emit('complete', null, models);
      fn && fn(models);  
    }
    
  }))

  contractStream.on('error', function(error){
    contract.emit('failure', error);
    contract.emit('complete', error);
    errorfn && errorfn(error);
  })

  contractStream.end(contract.req);

  contract.stream = contractStream;
  
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