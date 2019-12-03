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
