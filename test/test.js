var Client = require('../src');

describe('diggerclient', function(){

  it('should connect a container', function(done) {

    var $digger = Client();

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

  it('should accept a user', function(done) {

    var $digger = Client({
      user:{
        fullname:'Bob',
        id:10
      }
    });

    $digger.user.fullname.should.equal('Bob');
    $digger.user.id.should.equal(10);
    done();
  })

  it('should include the blueprint API', function(done) {

    var $digger = Client();

    var print = $digger.create({
      _digger:{
        tag:'blueprint'
      },
      name:'test'
    })

    $digger.blueprint.add(print);

    var print = $digger.blueprint.get('test');

    print.count().should.equal(1);
    done();

  })


})
