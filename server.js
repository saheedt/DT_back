let express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),
	expressValidator = require('express-validator'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	mongojs = require('mongojs');
	require('dotenv').config();

let app = express();
let MongoStore = require('connect-mongo');

let db = mongojs(process.env.DBConnectString, [process.env.UsersCollection, process.env.LeaderboardCollection, process.env.CategoryCollection]);
let ObjectId = mongojs.ObjectId;
db.users.find((err, docs)=>{
	if (err){
		console.log(err);
	}else{
		console.log(docs)
	}
})

//app.use(cookieParser(process.env.secretKey));
//mongo store not working..
/*app.use(session({
	secret: process.env.secretKey,
	store: new MongoStore({
		db: process.env.DBConnectString,
		//host: process.env.DBHost,
		//port : process.env.DBPort
	})
}));*/

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

app.listen(3000);
console.log('dt_back started on port 3000');
