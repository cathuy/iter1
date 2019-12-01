const express = require('express')
var randomWords = require('random-words');
var tcom = require('thesaurus-com')
const app = express()
const session = require('express-session');
const path = require('path')
const http = require('http').Server(app)
const socketIO = require('socket.io')
const bodyParser = require("body-parser")
const PORT = process.env.PORT || 5000


//database
const { Pool } = require('pg');
var pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});
pool.connect();

//session
app.use(session({
    secret: "weird sheep",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    if (req.session.user) {
        console.log('user already logged in')
        res.render('pages/index')
        //res.send("<script>alert('welcome come back');location.href='/';</script>")
    } else {
        console.log('user not log in yet')
        res.render('pages/index')
    }
});

const server = app.listen(PORT, () => {
    console.log("Listening on port: " + PORT);
});

const io = require('socket.io')(server);

// store user data in variable room
var rooms = []
var votingRoom
 //Socket.io on connection event
io.on('connection', (socket) => {

    if (socket.user === undefined || socket.room === undefined) {
        io.to(socket.user).emit("giveuser");
    }

    //User disconnect event listener.
    socket.on('disconnect', function() {
        /* Code:
        Remove user from socket.
        Search user in it's room and remove it from user array of the room.
        If room is empty, remove the room.
        */
        socket.leave(socket.room);
        var user_idx = -1;

        //Check if user room is lost. Common cause: Server restart.
        if (rooms[socket.room] != undefined) {
            for (var i = 0; i < rooms[socket.room].user_array.length; i++) {
                if (rooms[socket.room].user_array[i][0] === socket.user) {
                    //Find user in user array. O(length)
                    user_idx = i;
                    break;
                }
            }

            //Remove user from user_array.
            rooms[socket.room].user_array.splice(user_idx, 1);

            if (rooms[socket.room].user_array.length === 0) {
            delete rooms[socket.room];
            }

            //Update people online for other users.
            io.sockets.in(socket.room).emit('user_disconnect', socket.user);
            //remove user from the database
            //var deleteroom = `DELETE FROM game_room WHERE room_id='${socket.room}' AND name='${socket.user}'`;
            
            console.log(socket.user + " disconnected.");

        } else {
            console.log("Probable Server Restart. Disconnecting user to reconnect. user: %s room: %s", socket.user, socket.room);
        }

    });

    //io.to('${socket.user}').emit(word);
    // adding user to room
    socket.on('addToRoom', function(roomName) {
        /* Code:
        Add user to room.
        Add custom property .user .room to socket for later identification.
        Search if room exists. Add user.
        */

        socket.room = roomName.room;
        socket.user = roomName.user;
        // room is empty
        var flag = 0;
        for (var key in rooms) {
            if (key === socket.room) {
                flag = 1;
                break;
            }
        }
        // room empty
        if (flag === 0) {
            // starting a new room and new user array
            rooms[socket.room] = {
                name: socket.room,
                user_array: []
            }
            rooms[socket.room].user_array.push([socket.user]);
            //Add socket to provided room
            socket.join(socket.room);

            //Send user_connect msg to other users in room.
            io.sockets.in(socket.room).emit('user_connect', rooms[socket.room].user_array);
            votingRoom=socket.room
            console.log(socket.user + " connected to room " + socket.room + ". Current users: " + rooms[socket.room].user_array.length);
            console.log("New room started");
            console.log("flag: " + flag);

            // room not empty
        } else {
            // room full
            if (rooms[socket.room].user_array.length >= 7) {
                console.log("Invalid user: " + socket.user);
                console.log("This room is full!");

                // add socket to user array
                rooms[socket.room].user_array.push([socket.user]);

                //Add socket to provided room
                socket.join(socket.room);

                //Send user_connect msg to other users in room.
                io.sockets.in(socket.room).emit('user_connect', rooms[socket.room].user_array);
                // forcing current user to disconnect
                io.sockets.to(socket.id).emit('force_disconnect');

                // room not full

            } else {

                // add socket to user array
                rooms[socket.room].user_array.push([socket.user]);

                //Add socket to provided room
                socket.join(socket.room);

                //Send user_connect msg to other users in room.
                io.sockets.in(socket.room).emit('user_connect', rooms[socket.room].user_array);

                console.log(socket.user + " connected to room " + socket.room + ". Current users: " + rooms[socket.room].user_array.length);
                console.log(rooms[socket.room].user_array[0]);
                // testing
                console.log("Room not full: adding new player");
                console.log("flag: " + flag);

                //send keyword to specific user in room
                if (rooms[socket.room].user_array.length == 4) {
                    var word = randomWords()
                    var synonym = tcom.search(word).synonyms[0]
                    //var gamer = rooms[socket.room].user_array[0]
                    io.sockets.to(socket.id).emit('getword', word)
                    console.log(word)
                    //console.log(gamer)
                    // for (var iter = 1; iter < rooms[socket.room].user_array.length; iter++) {
                    // var other_gamer = rooms[socket.room].user_array[iter]
                    // console.log(other_gamer)
                    // io.sockets.to(other_gamer).emit('getword', synonym);
                    // }
                    socket.to(socket.room).emit('getword', synonym);
                    console.log(synonym)
                    var gameroom = `SELECT * FROM game_room`;
                    pool.query(gameroom, (error, result) => {
                        if (error) {
                            console.log(error);
                        } else {
                            var room_code = socket.room;
                            var vote = 0;
                            var name = rooms[socket.room].user_array;
                            for (var iter = 0; iter < rooms[socket.room].user_array.length; iter++) {
                                var gamer = rooms[socket.room].user_array[iter];
                                var insertQuery = `INSERT INTO game_room("room_id", "name","vote")VALUES('${room_code}' , '${gamer}', ${vote})`
                                pool.query(insertQuery,(err,res)=>{
                                    if(err)
                                    console.log(err)
                                })
                            }
                        }
                    })
                }
            }
        }
    });

    //Broadcast users message to its room.
    socket.on('chat', function(msg) {
        // sending to all clients in 'game' room, including sender
        io.in(socket.room).emit('chat', { "user": socket.user, "msg": msg });

        // socket.broadcast.to(socket.room).emit('chat',{"user":socket.user,"msg":msg});
        // io.emit('chat',{"user":socket.user,"msg":msg});
        console.log(socket.user + ": " + msg + ". From room# " + socket.room);
    });

    //Broadcast voting event
    socket.on('vote',(data)=>{
        console.log(data)
        socket.broadcast.emit('receiveData',data);
        // socket.to(socket.room).emit('receiveData',data)
    });
    
    socket.on('lose',(data)=>{
        insertQuery=`DELETE FROM TABLE game_room WHERE room_id= '${votingRoom}' and name='${data.name}'`
        pool.query(insertQuery,(req,res,err)=>{
            if(err)
            console.log(err)
        })
        // socket.to(socket.room).emit('receiveData',data)
    });

});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
//Get Room id from url
app.get('/chatRoom.html/:roomName', function(req, res) {
    activeChat = req.params.roomName;
    // res.sendFile(__dirname + "/public/" + "chatRoom.html");
    res.render('pages/chatRoom')
});

// app.get('/chatRoom.html/:roomName/', function(req, res) {
//     activeChat = req.params.roomName;
//     // res.sendFile(__dirname + "/public/" + "chatRoom.html");
//     res.render('pages/chatRoom')
// });


//user login action

app.post('/login_action', (req, res) => {

    params = JSON.parse(JSON.stringify(req.body))
    NAME = params['name']
    PASSWORD = params['password']
    var getInfoQuery =
    `SELECT game_info.username, game_info.time, game_info.result, game_info.word, game_info.spy
    FROM game_info,Admin
    WHERE Admin.username=game_info.username AND game_info.username = '${NAME}' AND Admin.password = '${PASSWORD}'`

    var getWhole = `SELECT * FROM Admin`;
    if (NAME == 'carinaA' && PASSWORD == '123') {
        pool.query(getWhole, (error, result) => {
            if (error)
                res.end(error);
            var results = { 'rows': result.rows };
            console.log(results);
            req.session.user = NAME;
            req.session.password = PASSWORD;
            res.render('pages/admin_data', results)
        });
    } else {
        pool.query(getInfoQuery, (error, result) => {
            if (error) {
                console.log(error)
                console.log(`wrong username and password`)
                res.send("<script>alert('Incorrect Username and/or Password!');location.href='../#t4';</script>")
                // response.send('Incorrect Username and/or Password!');
                // res.end(error);
            } else {
                if (result.rowCount == 0) {
                    console.log(result)
                    console.log(`wrong username and password`)
                    res.send("<script>alert('Incorrect Username and/or Password!');location.href='../#t4';</script>")
                } else {
                    console.log("this user is in our database");
                    var results = { 'rows': result.rows };
                    req.session.user = NAME;
                    req.session.password = PASSWORD;
                    res.render('pages/gamer_data', results)
                }
            }
        });
    }
});


//user sign up
app.post('/signup_action', (req, res) => {
    params = JSON.parse(JSON.stringify(req.body))
    NAME = params['name']
    PASSWORD = params['password']
    console.log(PASSWORD)
    confirm_ps = params['enter_password_again']
    var Twins = 0
    var Total_games = 0
    var TIME = NaN
    var RESULT = 0
    var SPY = 0
    var WORD = NaN

    if (PASSWORD == confirm_ps) {
        insertQuery = `INSERT INTO Admin("username", "password","total_wins", "total_games")
        VALUES( '${NAME}' , '${PASSWORD}', ${Twins} , ${Total_games})`
        pool.query(insertQuery, function(err, result, fields) {
            if (err) {
                console.log("fail to sign up")
                res.send("<script>alert('Please use another names!');location.href='../#t4';</script>")
            } else {
                insertQuery2 = `INSERT INTO game_info("username","time","result","word","spy")
                    VALUES('${NAME}','${TIME}',${RESULT},'${WORD}',${SPY})`
                pool.query(insertQuery2, function(err, result, fields) {
                    if (err) {
                        console.log("fail to insert to game_info")
                        res.send(err)
                    } else {
                        console.log("success to sign up")
                        res.redirect('../#t4')
                    }
                });
            }
        });
    } else { console.log("please enter password again") }
});

//user enter chatroom
app.post('/chatRoom.html', (req, res, err) => {
    if (!req.session.user)
        res.send("<script>alert('Please login!');location.href='../#t4';</script>")
    else
        // res.sendFile(__dirname + "/public/" + "chatRoom.html")
        res.render('pages/chatRoom')
})

// // voting
// app.post('/voting',(req,res)=>{
//     // var room=socket.room
//     // insertQuery=`SELECT name FROM game_room WHERE room.id= '${room}'`
//     // pool.query(insertQuery,(req,res)=>{
//         // var results = { 'rows': res.rows };
//         // console.log(results);
//         res.render('pages/voting',results)
//     // })
// })

app.post('/voting',(req,res)=>{
    roomName=req.params.roomName
    insertQuery=`SELECT name,vote FROM game_room WHERE room_id= '${votingRoom}'`
    pool.query(insertQuery,(req,result,err)=>{
        if(!err) {
            console.log(votingRoom)
            var results = {'rows': result.rows };
            console.log(results);
            res.render('pages/voting',results)
        }
    });
    // open('https://stark-chamber-06109.herokuapp.com/voting', function(err){
    //     if(err) 
    //         throw err;
    // });
});

//user log out
app.post('/logout_action', (req, res) => {
    req.session.destroy(function(err) {
        console.log(err);
    })
    console.log("sucessful log out");
    res.render('pages/index');
});
