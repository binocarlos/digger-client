var SupplyChain = require('./supplychain');

module.exports = function(options){
	options = options || {};
	return new SupplyChain(options);
}