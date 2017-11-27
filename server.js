'use strict';

const routes = require('./routers/routes').routes ;
const express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),
	expressValidator = require('express-validator'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	MongoStore = require('connect-mongo')(session),
	cors = require('cors'),
	app = express();
	require('dotenv').config();


let port = process.env.PORT || 8000;

app.use((req, res, next) => {
	res.locals.errors = null;
	res.locals.docs = null;
	res.header("Access-Control-Allow-Origin", "*");
	return next();
});

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
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('public'));



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
routes(app);
app.listen(port);