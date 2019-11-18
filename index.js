const express = require('express')
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
        console.log('welcome' + req.session.user + 'come back');
        res.render('pages/index')
    } else {
        console.log('user not log in yet')
        res.render('pages/index')
    }
});

const server = app.listen(PORT, () => {
    console.log("Listening on port: " + PORT);
});

const io = require('socket.io')(server);


io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
    socket.on('chat', function(message) {
        console.log("chat message: " + message);
        io.emit('message', message);
    });
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);



//user login action

app.post('/login_action', (req, res) => {

    params = JSON.parse(JSON.stringify(req.body))
    NAME = params['name']
    PASSWORD = params['password']
    var getInfoQuery = `SELECT *FROM game_info WHERE "username" =  '${NAME}'`
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
    }
    else{
    pool.query(getInfoQuery, (error, result) => {
        if (error) {
            console.log(`this user is not existed`)
            response.send('Incorrect Username and/or Password!');
            res.end(error);
        }
        console.log("this user is in our database");
        var Results     //Admin
        req.session.user = NAME;
        req.session.password = PASSWORD;
        var results = { 'rows': result.rows };
        console.log(results)
        res.render('pages/gamer_data',results)
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
                insertQuery2=`INSERT INTO game_info("username","time","result","word","spy") 
                VALUES('${NAME}','${TIME}',${RESULT},'${WORD}',${SPY})`
              pool.query(insertQuery2,function(err,result,fields){
                  if(err){
                    console.log("fail to insert to game_info")
                    res.send(err)
                  }
                  else{
                      console.log("success to sign up")
                     res.redirect('../#t4')
                  }
              });
                
            }
        });
    } else { console.log("please enter password again") }
});

app.post('/chatRoom.html',(req,res,err)=>{
    if(!req.session.user)
        res.send("<script>alert('Please login!');location.href='../#t4';</script>")
    else
        res.sendFile(__dirname+"/public/"+"chatRoom.html")
})

//user log out
app.post('/logout_action', (req, res) => {
    req.session.destroy(function(err) {
        console.log(err);
    })
    console.log("sucessful log out");
    res.render('pages/index');
});
