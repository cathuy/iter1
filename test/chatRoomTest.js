var socketURL='http:localhost5050/chatRoom.html'
var chatUser1={'name':'Tom'}
var chatUser2={'name':'April'}
var chatUser3={'name':'Wendy'}
var options ={
    transports: ['websocket'],
    'force new connection': true
  };
 // chat room test case reference from http://liamkaufman.com/blog/2012/01/28/testing-socketio-with-mocha-should-and-socketio-client/ 
describe("chat Room",function(){
    it('should broadcast a new user to all users',function(done){
        var client1 = io.connect(socketURL, options);

        client1.on('connect', function(name){
            client1.emit('user_connect', chatUser1);
            name.should.equal(chatUser1.name+"has joined")

            var client2 = io.connect(socketURL, options);
            client2.on('connect', function(username){
                client2.emit('user_connect', chatUser2);
                username.should.equal(chatUser2.name+"has joined");
                client2.disconnect();
            })
         client1.disconnect();
        
        })
      
    });
    it('Should be able to broadcast messages', function(done){
        var client1, client2, client3;
        var message = 'welcome to who is the spy!';
        var messages = 0;
      
        var checkMessage = function(client){
          client.on('chat', function(msg){
            message.should.equal(msg);
            client.disconnect();
            messages++;
            if(messages === 3){ // there are three clients
              done();
            };
          });
        };
      
        client1 = io.connect(socketURL, options);
        checkMessage(client1);
      
        client1.on('connect', function(data){
          client2 = io.connect(socketURL, options);
          checkMessage(client2);
      
        client2.on('connect', function(data){
            client3 = io.connect(socketURL, options);
            checkMessage(client3);
      
            client3.on('connect', function(data){
              client2.send(message);
            });
        });
    });
 });
      

});

 
