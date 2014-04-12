var Client = require('../src');
var through = require('through');

describe('diggerclient', function(){

	describe('constructor', function(){
	  it('should be a function', function() {
	    Client.should.be.type('function');
	  })

	  it('should return an event emitter', function(done) {
	  	var $digger = Client();
	  	$digger.on('hello', done);
	  	$digger.emit('hello');
	  })
	})

	describe('supplychain', function(){

		it('should return a supplychain from connect', function() {
			var $digger = Client();

			var supplychain = $digger.connect('/my/warehouse');

			supplychain.tag().should.equal('_supplychain');
			supplychain.diggerurl().should.equal('/my/warehouse');
		})


		it('should get a request packet from an event', function(done) {
			var $digger = Client();

			$digger.on('request', function(req, res){
				req.method.should.equal('post');
				req.url.should.equal('/digger');
				req.headers['Content-Type'].should.equal('application/json')
				req.body.method.should.equal('post');
				req.body.url.should.equal('/select');
				res.write({
					name:'test1'
				})
				res.write({
					name:'test2'
				})
				res.write({
					name:'test3'
				})
				res.end();
			})

			var supplychain = $digger.connect('/my/warehouse');

			supplychain('folder').ship(function(results){
				results.length.should.equal(3);
				results[0].name.should.equal('test1');
				results[1].name.should.equal('test2');
				results[2].name.should.equal('test3');
				done();
			})
		})

	})

})
