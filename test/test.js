var Client = require('../src');

describe('diggerclient', function(){

  it('should connect a container', function(done) {

    var $digger = new Client();

    $digger.on('request', function(req, reply){
    	reply(null, [{
    		_digger:{
    			tag:'apple'
    		}
    	}])
    })

    var container = $digger.connect('/');

    container.tag().should.equal('_supplychain');
    container.diggerurl().should.equal('/');

    container('something').ship.should.be.type('function');

    container('fruit').ship(function(results){
    	results.count().should.equal(1);
    	results.tag().should.equal('apple');
    	done();
    })
  })


})
