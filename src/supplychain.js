var EventEmitter = require('events').EventEmitter;
var utils = require('digger-utils');
var concat = require('concat-stream');
var Container = require('digger-container');
var Contracts = require('digger-contracts');
var Find = require('digger-find');
var through = require('through');

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

SupplyChain.prototype.stream = function(contract, fn){
  var self = this;
  var req = {
    method:'post',
    url:'/digger',
    headers:{
      'Content-Type':'application/json'
    },
    body:contract.req
  }

  var stream = through(function(model){
    this.queue(model)
  }, function(){
    this.queue(null)
  })

  process.nextTick(function(){
    self.emit('request', req, stream);  
  })
  
  return stream;
}

SupplyChain.prototype.ship = function(contract, fn, errorfn){
	var self = this;

  var contractStream = this.stream(contract);

  if(fn){
    contractStream.pipe(concat(function(models){
      contract.emit('success', models);
      contract.emit('complete', null, models);
      fn && fn(models);
    }))

    contractStream.on('error', function(error){
      contract.emit('failure', error);
      contract.emit('complete', error);
      errorfn && errorfn(error);
    })
  }

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