var Client = require('../src');
var through = require('through2');
var concat = require('concat-stream')

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
				
				req.pipe(through.obj(function(contract, enc, cb){
				
					contract.method.should.equal('post')
					contract.url.should.equal('/select')
					contract.headers['Content-Type'].should.equal('application/json')
					contract.headers['x-digger-selector'].should.equal('folder')
					contract.body.length.should.equal(1);
					contract.body[0].should.equal('/warehouse/my/warehouse');

						
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
				results.count().should.equal(3);
				results.get(0).name.should.equal('test1');
				results.get(1).name.should.equal('test2');
				results.get(2).name.should.equal('test3');
				done();
			})
		})


		it('should do a simple duplex request', function(done) {
			var supplychain = Client();

			supplychain.on('request', function(req, res){


				req.method.should.equal('post')
				req.url.should.equal('/stream')

				var contract = req.headers['x-digger-contract'];
				contract.headers['Content-Type'].should.equal('application/json')
				contract.headers['x-digger-selector'].should.equal('folder')

				req.pipe(through.obj(function(chunk, enc, cb){
					chunk.count = (chunk.id * 2) + 1;
					res.write(chunk)
					cb()
				}, function(){
					res.end()
				}))

			})

			var $digger = supplychain.connect('/my/warehouse');

			var contract = $digger('folder').duplex()

			var results = {};
			contract.pipe(through.obj(function(chunk, enc, cb){
				results[chunk.id] = chunk.count;
				this.push(chunk)
				cb()
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

	

		it('should do a simple streaming request', function(done) {
			var supplychain = Client();

			supplychain.on('request', function(req, res){

				req.method.should.equal('post')
				req.url.should.equal('/ship')

				req.pipe(concat(function(c){
					var contract = c[0]

					contract.headers['Content-Type'].should.equal('application/json')
					contract.headers['x-digger-selector'].should.equal('folder')

					contract.body.length.should.equal(1)
					contract.body[0].should.equal('/warehouse/my/warehouse')

					res.push({id:1,count:2})
					res.push({id:2,count:4})
					res.push({id:3,count:6})
					res.push(null)
				}))

			})

			var $digger = supplychain.connect('/my/warehouse');

			var contract = $digger('folder').stream()

			var results = {};
			contract.pipe(through.obj(function(chunk, enc, cb){
				chunk.count.should.equal(chunk.id*2)
				results[chunk.id] = chunk.count;
				this.push(chunk)
				cb()
			}, function(){
				results['1'].should.equal(2);
				results['2'].should.equal(4);
				results['3'].should.equal(6);
				done();
			}))

		})


		it('should catch a streaming error in the ship handler', function(done) {
			var supplychain = Client();

			supplychain.on('request', function(req, res){

				req.method.should.equal('post')
				req.url.should.equal('/ship')
				req.headers['Content-Type'].should.equal('application/json')

				res.statusCode = 500;
				res.end('this is a test error')

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
