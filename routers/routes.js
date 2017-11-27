'use strict';

const controllers = require('../controllers/controllers.js'),
	   jwt = require('jsonwebtoken');


const isAuthorized = (req, res, next) =>{
	let token = req.body.token

	jwt.verify(token, process.env.TokenSecret, (err, decoded)=>{
		if(req.headers['x-is-admin'] == '1'){
			if(err){
				res.json({error: {name: err.name, message: err.message}})
				return
			}
			if(decoded){
				next()
				return
			}
			
		}
		if(req.headers['x-is-admin'] == '0'){
			if(err){
				res.json({error: {name: err.name, message: err.message}})
				return
			}
			if(decoded){
				next()
				return
			}		
		}
	})
};

const setHeader = (req, res, next) => {
	res.set("Access-Control-Allow-Origin", "*")
	res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE")
	res.set("Access-Control-Allow-Headers", ["x-is-admin, Origin, X-Requested-With, Content-Type, Accept, Authorization"])
	res.set("Access-Control-Allow-Credentials", true)
	next();
}

exports.routes = (app) => {

	//View routes..
	app.route('/').get(controllers.showLogin);
	app.route('/home').get(controllers.showHome);
	app.route('/add').get(controllers.showAdd);
	app.route('/edit').get(controllers.showEdit);

	//DB routes..

	//login routes
	app.route('/api/createuser').post(setHeader, controllers.createUser);
	app.route('/api/login').post(setHeader, controllers.login);
	app.route('/api/createBackuser').post(setHeader, controllers.createBackUser);

	//category routes
	app.route('/api/createcategory').post(isAuthorized, setHeader, controllers.createCategory);
	app.route('/api/category').post(isAuthorized, setHeader, controllers.getCategory);

	//level routes
	app.route('/api/createlevel').post(isAuthorized, setHeader, controllers.createLevel);
	app.route('/api/level').post(isAuthorized, setHeader, controllers.level);

	//question routes
	app.route('/api/createquestion').post(isAuthorized, setHeader, controllers.createQuestion);
	app.route('/api/question').post(isAuthorized, setHeader, controllers.getQuestions);
	app.route('/api/updatequestion').post(isAuthorized, setHeader, controllers.updateQuestion);
	app.route('/api/deletequestion').post(/*isAuthorized, controllers.deleteQuestion*/); //TODO

	//score route
	app.route('/api/updatescore').post(isAuthorized, setHeader, controllers.addScore);
	app.route('/api/updateleaders').post(isAuthorized, setHeader, controllers.addToLeaderBoard);

	//add answered route
	app.route('/api/answered').post(isAuthorized, setHeader, controllers.answered)
}