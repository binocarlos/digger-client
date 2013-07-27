var Client = require('../src');

describe('diggerclient', function(){

  it('should connect a container', function() {

    var $digger = Client(function(req, done){

    })

    var container = $digger.connect('/');

    container.tag().should.equal('_supplychain');
    container.diggerurl().should.equal('/');

    container('something').ship.should.be.a('function');
  })


})
