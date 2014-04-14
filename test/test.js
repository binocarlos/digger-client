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

		it('should do a simple ship request', function(done) {
			var supplychain = Client();

			supplychain.on('request', function(req, res){

				req.method.should.equal('post')
				req.url.should.equal('/ship')
				req.headers['Content-Type'].should.equal('application/json')

				req.pipe(through(function(contract){

					contract.method.should.equal('post')
					contract.url.should.equal('/select')
					contract.headers['Content-Type'].should.equal('application/json')
					contract.headers['x-digger-selector'].should.equal('folder')
					contract.body.length.should.equal(1);
					contract.body[0].should.equal('/my/warehouse');

						
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
					
				}))

			})

			var $digger = supplychain.connect('/my/warehouse');

			$digger('folder').ship(function(results){
				results.length.should.equal(3);
				results[0].name.should.equal('test1');
				results[1].name.should.equal('test2');
				results[2].name.should.equal('test3');
				done();
			})
		})


		it('should do a simple streaming request', function(done) {
			var supplychain = Client();

			supplychain.on('request', function(req, res){

				req.method.should.equal('post')
				req.url.should.equal('/select')
				req.headers['Content-Type'].should.equal('application/json')
				req.headers['x-digger-selector'].should.equal('folder')

				req.pipe(through(function(chunk){
					chunk.count = (chunk.id * 2) + 1;
					res.write(chunk)
				}, function(){
					res.end()
				}))

			})

			var $digger = supplychain.connect('/my/warehouse');

			var contract = $digger('folder').stream()

			var results = {};
			contract.pipe(through(function(chunk){
				results[chunk.id] = chunk.count;
				this.queue(chunk)
			}, function(){
				results['5'].should.equal(11);
				results['6'].should.equal(13);
				results['7'].should.equal(15);
				done();
			}))

			contract.write({
				id:5
			})

			contract.write({
				id:6
			})

			contract.write({
				id:7
			})

			contract.end();
		})


		it('should catch a streaming error in the ship handler', function(done) {
			var supplychain = Client();

			supplychain.on('request', function(req, res){

				req.method.should.equal('post')
				req.url.should.equal('/ship')
				req.headers['Content-Type'].should.equal('application/json')

				req.pipe(through(function(chunk){
					
				}, function(){
					res.statusCode = 500;
					res.end('this is a test error')
				}))

			})

			var $digger = supplychain.connect('/my/warehouse');

			var contract = $digger('folder').ship(function(){

			}, function(error){
				error.should.equal('this is a test error');
				done();
			})
		})

	})

})
