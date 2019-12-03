var chai=require('chai');
const app=require('../index');
var chaiHttp=require('chai-http');
var should=chai.should();
 
 
describe('Index/signup_action',function(){
    it('should signup with unique username',function(done){
        chai.request(app)
          .post('/signup_action')
          .send({
              name:qqq,    //unique username in the database
              password:123,
              enter_password_again:123
          })
          .end(function(err,res){
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('SUCCESS');
                res.body.SUCCESS.should.be.a('object');
                res.body.SUCCESS.should.have.property('name');
                res.body.SUCCESS.should.have.property('password');
                res.body.SUCCESS.should.have.property('enter_password_again');
                res.body.SUCCESS.name.should.equal('qqq');
                res.body.SUCCESS.password.should.equal('123');
                res.body.SUCCESS.enter_password_again.should.equal('123');
                done();
          })
    });
     
    it('cannot sign up without unique username',function(done){
        chai.request(app)
          .post('/signup_action')
          .send({
              name:April,    //already in the database
              password:123,
              enter_password_again:123
            })
          .end(function(err,res){
              res.should.have.status(400);
              done();
             });
          
          
        });
    
    it('cannot sign up when the password and enter_password_Again are not eqeal',function(done){
        chai.request(app)
        .post('/signup_action')
        .send({
            name:fqp,
            password:234,
            enter_password_again:123
        })
        .end(function(err,res){
            res.should.have.status(400);
            done();
        })

    });


});

describe('Index/login_action',function(){
    it('should login user when user is in the database',(done)=>{
        chai.request(app)
            .post('/login_action')
            .send({
                name:April,
                password:123
            })
            .end((err,res)=>{
                res.should.have.status(200);
                done();
            })
        
    });

    it('should reject invalid login when username is not in db',(done)=>{
        chai.request(app)
            .post('/login_action')
            .send({
                name:123,
                password:456
            })
            .end((err,res)=>{
                res.should.have.status(400);
                done();
            })
    });

    it('should reject invalid login when password is wrong although the username is in the db already',(done)=>{
        chai.request(app)
            .post('login_action')
            .send({
                name:April,
                password:345 //actual password is 123
            })
            .end((err,res)=>{
                res,should.have.status(400);
                done();
            })

    });

});
//test case for sharing 
import { isMainThread } from "worker_threads";
describe('share', function() {

    before(function() {
        this.server = http.createServer(app).listen(5050);
        this.browser = new Browser({ site: 'http://localhost:5050' });
    });
    it('chatroom screen show up');
    // load the contact page
    before(function(done) {
        this.browser.visit('/chatRoom', done);
        it('should show contact a form', function() {
            assert.ok(this.browser.success);
        });
    });

});
describe('.roomurl', function() {

    before(function() {
        this.server = http.createServer(app).listen(3000);
        this.browser = new Browser({ site: 'http://localhost:3000' });
    });

    // load the contact page before each test
    beforeEach(function(done) {
        this.browser.visit('/contact', done);
    });

    it('should show contact a form', function() {
        assert.ok(this.browser.success);
        assert.equal(this.browser.text('#yourCode'), 'ROOMCODE');

    });

    it('should refuse empty submissions', function(done) {
        var browser = this.browser;
        browser.pressButton('Send').then(function() {
            assert.ok(browser.success);
            assert.equal(browser.text('#yourCode'), 'ROOMCODE');

            assert.equal(browser.text('div.alert'), 'Please fill in all the fields');
        }).then(done, done);
    });

    it('should refuse partial submissions', function(done) {
        var browser = this.browser;
        browser.fill('first_name', 'John');
        browser.pressButton('Send').then(function() {
            assert.ok(browser.success);

            assert.equal(browser.text('#yourCode'), 'ROOMCODE');
            assert.equal(browser.text('div.alert'), 'Please fill in all the fields');
        }).then(done, done);
    });

    it('should keep values on partial submissions', function(done) {
        var browser = this.browser;
        browser.fill('ROOMCODE');
        browser.pressButton('Send').then(function() {
            assert.equal(browser.field('ROOMCODE').value, 'ROOMCODE');
        }).then(done, done);
    });

    it('should refuse invalid ROOMCODE', function(done) {
        var browser = this.browser;
        browser.fill('ROOMCODE');
        browser.pressButton('Send').then(function() {
            assert.ok(browser.success);
            ssert.equal(browser.text('#yourCode'), 'ROOMCODE');

            assert.equal(browser.text('div.alert'), 'Please check the email address format');
        }).then(done, done);
    });

    it('should accept complete submissions', function(done) {
        var browser = this.browser;
        browser.fill('ROOMCODE');
        browser.pressButton('Send').then(function() {
            assert.ok(browser.success);
            ssert.equal(browser.text('#yourCode'), 'ROOMCODE');
            assert.equal(browser.text('p'), 'Thank you for your message. We\'ll answer you shortly.');
        }).then(done, done);
    });

    after(function(done) {
        this.server.close(done);
    });

});





describe('Index/logout_action',function(){
    it('should remove April session when she logout',(done)=>{
      chai.request(app)
           .post('logout_action')
           .end((err,res)=>{
               if(err)
               return done(err);

               res.body.should.status(200);
    
           })
    })
})
