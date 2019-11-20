const express = require('express')
var randomWords = require('random-words');
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
        console.log(randomWords());

        res.render('pages/index')
    }
});
// app.get('/#t4', (req, res) => {
//     if (req.session.user) {
//         if (req.session.user == 'carinaA') {
//             var getWhole = `SELECT * FROM Admin`;
//             pool.query(getWhole, (error, result) => {
//                 if (error)
//                     res.end(error);
//                 var results = { 'rows': result.rows };
//                 console.log(results);
//                 res.render('pages/admin_data', results)
//             });

//         }
//     }
// });
const server = app.listen(PORT, () => {
    console.log("Listening on port: " + PORT);
});

const io = require('socket.io')(server);

// store user data in variable room
var rooms = []
    //Socket.io on connection event
io.on('connection', (socket) => {

    if (socket.user === undefined || socket.room === undefined) {
        io.to(socket.user).emit("giveuser");
    }

    //User disconnect event listener.
    socket.on('disconnect', function() {
        /*  Code:
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
            console.log(socket.user + " disconnected.");

        } else {
            console.log("Probable Server Restart. Disconnecting user to reconnect. user: %s room: %s", socket.user, socket.room);
        }
    });
    // adding user to room
    socket.on('addToRoom', function(roomName) {
        /*  Code:
                Add user to room.
                Add custom property .user .room to socket for later identification.
                Search if room exists. Add user.
        */

        socket.room = roomName.room;
        socket.user = roomName.user;

        var flag = 0; //NOTE: No race conditions observed now

        for (var key in rooms) {
            if (key === socket.room) {
                flag = 1;
                break;
            }
        }

        if (flag === 0) {
            rooms[socket.room] = {
                name: socket.room,
                user_array: []
            }
            rooms[socket.room].user_array.push([socket.user]);
        } else {
            rooms[socket.room].user_array.push([socket.user]);
        }

        //Add socket to provided room
        socket.join(socket.room);

        //Send user_connect msg to other users in room.
        io.sockets.in(socket.room).emit('user_connect', rooms[socket.room].user_array);

        //Send the current user it's server socket.id to use as peerjs id. Ensures uniqueness on custom server.
        // io.to(socket.id).emit('socket_id',socket.id);

        console.log(socket.user + " connected.");
    });

    //Broadcast users message to its room.
    socket.on('chat', function(msg) {

        // sending to all clients in 'game' room, including sender
        io.in(socket.room).emit('chat', { "user": socket.user, "msg": msg });

        // socket.broadcast.to(socket.room).emit('chat',{"user":socket.user,"msg":msg});
        // io.emit('chat',{"user":socket.user,"msg":msg});
        console.log(socket.user + ": " + msg + ". From room# " + socket.room);
    });

});

// socket.on('chat message', function(msg){
//     var keys = Object.keys(socket.rooms);
//     for (var i = 0; i < keys.length; i++) {
//         io.to(socket.rooms[keys[i]]).emit('chat message', msg);
//     }
// });


setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
//Get Room id from url
app.get('/chatRoom.html/:roomName', function(req, res) {

    activeChat = req.params.roomName;
    res.sendFile(__dirname + "/public/" + "chatRoom.html");

});

app.get('/chatRoom.html/:roomName/', function(req, res) {

    activeChat = req.params.roomName;
    res.sendFile(__dirname + "/public/" + "chatRoom.html");

});


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
                if(result.rowCount == 0) {
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
        res.sendFile(__dirname + "/public/" + "chatRoom.html")
})



//user log out
app.post('/logout_action', (req, res) => {
    req.session.destroy(function(err) {
        console.log(err);
    })
    console.log("sucessful log out");
    res.render('pages/index');
});


//user enter room code to join an existing room
// app.post('/join_room',(req,res) =>{
//     params = JSON.parse(JSON.stringify(req.body))
//     code = params['roomid']
//     var getRoomQuery = `SELECT * FROM gameroom WHERE "roomid" =  ${code}`
//     va
//     pool.query(getRoomQuery, (error, result) => {
//         if (error) {
//             console.log(`the code is not exist`)
//             response.send('Incorrect code!');
//             res.end(error);
//         }
//         console.log("correctly code");
//         var count = 1;
//         var rows = result.rows;
//         rows.forEach((r)=> {
//             r.numberofplay++;  
//             var privates = r.private;
//             count++;
//         });
//         var insertGamerQuery = `INSERT INTO gametable("roomid", "gamername","private", "numberofplayer")
//         VALUES( ${code} , '${name}', ${privates} , ${count})`
//         pool.query(insertGamerQuery, function(err, fields) {
//             if (err) {
//                 console.log("fail add to gamer table")
//                 // res.redirect('/');
//                 res.send(err)
//             } else {
//                 console.log("success to enter game room")
//                 res.redirect('')
//             }
//         });
//     } else { console.log("please enter password again") }

//     });


// });
