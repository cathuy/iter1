const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
var app = express();
const bodyParser = require("body-parser");
const { Pool } = require('pg');
 

const server = app.listen(PORT, () => {
    console.log("Listening on port: " + PORT);
});
const io = require('socket.io')(server);

var pool;
pool = new Pool({
    connectionString: 'postgres://postgres:129409Zydayy@localhost/PLAYER'
});
pool.connect();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
const INDEX = path.join(__dirname, 'pages/index');
app.use((req, res) => res.sendFile(INDEX) );

 
 io.on('connection', (socket) => {

  console.log('Client connected');

  socket.on('disconnect', () => console.log('Client disconnected'));

});


setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
 






//user login action
app.post('/login_action', (req, res) => {
    params = JSON.parse(JSON.stringify(req.body))
    NAME = params['name']
    PASSWORD = params['password']
    var getUsersQuery = `SELECT * FROM public."Admin" WHERE "user_name" =  '${NAME}' and "password"='${PASSWORD}'`
    pool.query(getUsersQuery, (error, result) => {
        if (error) {
            console.log(`this user is not existed`)
            res.end(error);
        }
        console.log("this user is in our database");
        res.render('pages/index')
    });
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
    if (PASSWORD == confirm_ps) {
        insertQuery = `INSERT INTO public."Admin"("user_name", "password","Total_wins", "Total_games") 
        VALUES( '${NAME}' , '${PASSWORD}', ${Twins} , ${Total_games})`
        pool.query(insertQuery, function(err, result, fields) {
            if (err) {
                console.log("fail to sign up")
                res.redirect('/');
            } else {
                console.log("success to sign up")
                res.redirect('../#t3')
            }
        });
    } else { console.log("please enter password again") }
});



 