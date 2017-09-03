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

exports.routes = (app) => {

	//View routes..
	app.route('/').get(controllers.showLogin);
	app.route('/home').get(controllers.showHome);
	app.route('/add').get(controllers.showAdd);
	app.route('/edit').get(controllers.showEdit);

	//DB routes..

	//login routes
	app.route('/api/createuser').post(controllers.createUser);
	app.route('/api/login').post(controllers.login);
	app.route('/api/createBackuser').post(controllers.createBackUser);

	//category routes
	app.route('/api/createcategory').post(isAuthorized, controllers.createCategory);
	app.route('/api/category').post(isAuthorized, controllers.getCategory);

	//level routes
	app.route('/api/createlevel').post(isAuthorized, controllers.createLevel);
	app.route('/api/level').post(isAuthorized, controllers.level);

	//question routes
	app.route('/api/createquestion').post(isAuthorized, controllers.createQuestion);
	app.route('/api/question').post(isAuthorized, controllers.getQuestions);
	app.route('/api/updatequestion').post(isAuthorized, controllers.updateQuestion);
	app.route('/api/deletequestion').post(/*isAuthorized, controllers.deleteQuestion*/); //TODO

	//score route
	app.route('/api/updatescore').post(isAuthorized, controllers.addScore);
	app.route('/api/updateleaders').post(isAuthorized, controllers.addToLeaderBoard);

	//add answered route
	app.route('/api/answered').post(isAuthorized, controllers.answered)
}