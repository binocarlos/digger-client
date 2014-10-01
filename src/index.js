var SupplyChain = require('./supplychain');
//var hyperquest = require('hyperquest')
//var ndjson = require('ndjson')

module.exports = function supplychain(options){
	options = options || {};
	return new SupplyChain(options);
}

module.exports.http = function http(url, options){
	//var supplychain = supplychain(options)
}