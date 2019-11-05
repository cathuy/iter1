const express = require('express')
const app = express()
const path = require('path')
const http = require('http').Server(app)
const socketIO = require('socket.io')
const bodyParser = require("body-parser")

const PORT = process.env.PORT || 5000


//database
const { Pool } = require('pg');
var pool = new Pool({
    connectionString:  process.env.DATABASE_URL,
    ssl: true
});
pool.connect();


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => { res.render('pages/index') });

const server = app.listen(PORT, () => {
    console.log("Listening on port: " + PORT);
});

const io = require('socket.io')(server);


io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
  socket.on('chat',function(message){
    console.log("chat message: "+ message);
    io.emit('message',message);
  });
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);


//user login action

app.post('/login_action', (req, res) => {
    params = JSON.parse(JSON.stringify(req.body))
    NAME = params['name']
    PASSWORD = params['password']
    var getAdminQuery = `SELECT * FROM Admin WHERE "username" =  '${NAME}' and "password"='${PASSWORD}'`
    var getWhole = `SELECT * FROM Admin`;
    pool.query(getAdminQuery, (error, result) => {
        if (error) {
            console.log(`this user is not existed`)
            response.send('Incorrect Username and/or Password!');
            res.end(error);
        }
        console.log("this user is in our database");
        //Admin
        if (NAME != 'carinaA' && PASSWORD != '123') {
            var results = { 'rows': result.rows };
            console.log(results);
            res.render('pages/gamer_data', results)
        }
    });
    if (NAME == 'carinaA' && PASSWORD == '123'){
    pool.query(getWhole, (error, result) => {
        if (error)
            res.end(error);
        var results = { 'rows': result.rows };
        console.log(results);
        res.render('pages/admin_data', results)
    });}

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
        insertQuery = `INSERT INTO Admin("username", "password","total_wins", "total_games","time","result","word","spy")
        VALUES( '${NAME}' , '${PASSWORD}', ${Twins} , ${Total_games}, '${TIME}', ${RESULT}, '${WORD}',${SPY})`
        pool.query(insertQuery, function(err, result, fields) {
            if (err) {
                console.log("fail to sign up")
                // res.redirect('/');
                res.send(err)
            } else {
                console.log("success to sign up")
                res.redirect('../#t4')
            }
        });
    } else { console.log("please enter password again") }
});
