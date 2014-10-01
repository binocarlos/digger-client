var SupplyChain = require('./supplychain');
//var hyperquest = require('hyperquest')
//var ndjson = require('ndjson')

module.exports = function supplychain(options){
	options = options || {};
	return new SupplyChain(options);
}