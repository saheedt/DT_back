'use strict';
const express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),
	expressValidator = require('express-validator'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	MongoStore = require('connect-mongo')(session),
	mongojs = require('mongojs'),
	app = express();
	require('dotenv').config();


const db = mongojs(process.env.DBConnectString,
	[process.env.UsersCollection, process.env.LeaderboardCollection, 
	process.env.CategoryCollection, process.env.SessionCollection]);

let port = process.env.ServerPort;
let ObjectId = mongojs.ObjectId;

/*db.users.find((err, docs)=>{
	if (!err){
		console.log(docs);
		return;
	}
	console.log(err)
});
db.sessions.find((err, docs)=>{
	if(!err){
		console.log(docs);
		return;
	}
	console.log(err);
});*/

app.use(session({
	secret: process.env.secretKey,
	resave: true,
	saveUninitialized: false,
	store: new MongoStore({
		host: process.env.DBHost,
		port: process.env.DBPort,
		url: process.env.DBConnectString,
		auto_reconnect: true
	})
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(expressValidator({
	errorFormatter: (param, msg, value)=>{
		let namespace = param.split('.'),
			root = namespace.shift(),
			formParam = root;

			while(namespace.length){
				formParam += '[' + namespace.shift() + ']';
			}
			return {
				param: formParam,
				msg: msg,
				value: value
			};
	}
}));
db.on('connect', ()=>{
	console.log('database connected');
});
db.on('error', (err)=>{
	console.log('database error', err);
});


app.listen(port);
console.log('dt_back started on port:', port);
