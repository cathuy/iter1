
const express = require('express');
const app = express();
const path = require('path');
const PORT = process.PORT || 5000
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require("body-parser");

const { Pool } = require('pg');
var pool;
pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
app.get('/Creat',(req,res)=>{
  res.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// link to main page
app.get('/', function(req, res) {
  res.render('main.ejs');
});

//insert users info into database
app.post('/', (req,res) => {
  
  
});
//login
app.post('/login',(req,res)=>{
  name = JSON.parse(JSON.stringify(req.body))['NAMW']
  password = JSON.parse(JSON.stringify(req.body))['PASSWORD']
  
  
  
});
//insert users info into database
app.post('/Creat',(req,res)=>{
  params = JSON.parse(JSON.stringify(req.body))
  insertQuery = `INSERT INTO public."usertable"( "NAME", "PASSWORD")
    VALUES( '${params.name}' , ${params.password})`
        //console.log(insertQuery)
    pool.query(insertQuery, function(err, result, fields) {
        if (err) {
            console.log("fail to insert to user table")
            res.redirect('/');
        } else {
            console.log("success to insert into user")
            res.render('main.ejs')
        }
    });
  
});
//link to user page (display user info)
app.get('/users', function(req,res) {
  var userQuery=`SELECT * FROM usertable where uid=${req.id}`;
  pool.query(userQuery,(error,result) => {
    if(error)
				res.end(error)
    var result = {'rows': result.rows}
    res.render('/users.ejs',results)

	});
   
});
  
  //login to the system and redirect to home page
  app.post('/login',function(request, response){
    var username = request.body.username;
    var password = request.body.password;
    if(username && password){
      pool.query('SELECT * FROM usertable WHERE username =? AND password =? ', [username, password], function(error, results, fields){
        if(result.length>0){
          request.session.loggedin = true;
          request.session.username = username;
          response.redirect('/home');
        }
        else{
          response.send('Incorrect username or password!');
        }
        response.end();
      });
    }
    else
      {
        response.send('Please enter username and password!');
        response.end();
      }
  });

  

// server
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));