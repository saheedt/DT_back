'use strict';

const controllers = require('../controllers/controllers.js');

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
	//app.route('/api/applogin').post(/*controllers.appLogin*/);

	//category routes
	app.route('/api/createcategory').post(controllers.createCategory);
	app.route('api/deletecategory').post(/*controllers.deletcategory*/);
	app.route('/api/category').post(controllers.getCategory);

	//level routes
	app.route('/api/createlevel').post(controllers.createLevel);
	app.route('/api/deletelevel').post(/*controllers.deleteLevel*/);
	app.route('/api/level').post(controllers.level);

	//question routes
	app.route('/api/createquestion').post(controllers.createQuestion);
	app.route('/api/question').post(controllers.getQuestions);
	app.route('/api/updatequestion').post(controllers.updateQuestion);
	app.route('/api/deletequestion').post(/*controllers.deleteQuestion*/);

	//score route
	app.route('/api/addscore').post(/*controllers.addScore*/);
	app.route('/api/addtoleaders').post(/*controllers.addToLeaderBoard*/);

	//add answered route
	app.route('/api/answered').post(/*controllers.answered*/)
}