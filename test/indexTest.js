var controller = require('../index')
, http_mocks = require('node-mocks-http')
, should = require('should'),
mockery = require('mockery'),
nock = require('nock')
;

function buildResponse() {
return http_mocks.createResponse({eventEmitter: require('events').EventEmitter})
}

describe('Welcome Controller Tests', function() {

it('test', function(done) {
  nock('http://www.google.com').get('/').reply(200,'something funny')
    var response = buildResponse();
    var request  = http_mocks.createRequest({
        method: 'GET',
        url: '/'
    });

    response.on('end', function() {
        response._getData().should.eql('something funny')
        done()
    });

    //this.controller.handle(request, response,function() {
            done()
    //})
});


  before(function(){
    mockery.enable({
      warnOnUnregistered: false
    });

    mockery.registerMock('../index',{
      all: (cb)=> cb(null, ['name','password']),
      create: (name, password, cb)=>cb(null,{name: name, password: password })
    });
    this.controller = require('../index')
  });
  after(function (){
    mockery.disable()
  });
  it('sign up', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'POST',
            url: '/signup_action'
        });

        request.body = {
            username: "name",
            password: "password",
            enter_password_again:"password"
        };
        response.on('end', function () {
            response._isJSON().should.be.true;
            var data = JSON.parse(response._getData());
            should.not.exist(data.error);
            data.index.username.should.eql(request.body.username);
            data.index.password.should.eql(request.body.password);
            data.index.password.should.eql(request.body.enter_password_again);
            done()
        });
    });
    //this.controller.handle(request, response)
  //  done()



  before(function(){
    mockery.enable({
      warnOnUnregistered: false
    });

    mockery.registerMock('../index',{
      all: (cb)=> cb(null, ['name','password']),
      create: (name, password, cb)=>cb(null,{name: name, password: password })
    });
    this.controller = require('../index')
  });
  after(function (){
    mockery.disable()
  });
  it('login',function () {
    var response = buildResponse();
    var request = http_mocks.createRequest({
      method: 'POST',
      url: '/login_action'
    });
    response.on('end',function(){
      response._isJSON().should.be.true;

      var data = JSON.parse(response._getData())
      should.not.exist(data.error)
    //  data.index.length.should.eql(2)
      data.index[0].should.eql("name")
      data.index[1].should.eql("password")
      done()
    });
    //this.controller.handle(request, response)
    //done()
  });
});

// it('login', function(done){
//   var response = buildResponse();
//   var request = http_mocks.createRequest({
//     method: 'POST',
//     url: '/login_action'
//   })
// });
