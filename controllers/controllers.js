'use strict';
const bcrypt = require('bcrypt'),
      saltRounds = 10,
      utils = require('../utils/utils.js');
require('dotenv').config();

//*********view routes*************
exports.showLogin = (req, res) => {
	if (req.session.user){
		res.redirect('/home');
		return;
	}
	res.render('login', {
		title: 'Sign In',
		errors: ''
	});
}

exports.showHome = (req, res) => {
	if(!req.session.user){
		res.redirect('/');
		return;
	}
	res.render('home', {
		errors: ''
	});
}

exports.showAdd = (req, res) => {
	if(!req.session.user){
		res.redirect('/');
		return;
	}
	res.render('add', {
		errors:'',
		category: '',
		level:''
	});
}


//*********api routes****************

exports.createUser = (req, res) => {
	//db.users.
	let errors;
	req.checkBody('email', 'email is required.').notEmpty();
	req.checkBody('email', 'email is invalid.').isEmail();
	req.checkBody('screenname', 'Screen Name is required.').notEmpty();
	req.checkBody('password', 'Password is required.').notEmpty();
	req.checkBody('password', 'Password should be between 8 to 30 characters.').len(8, 30);
	req.checkBody('password_repeat', 'Password confirmation is required.').notEmpty();
	req.checkBody('admin', 'You are not allowed here.').notEmpty();
	req.checkBody('admin', 'You are not allowed this resource.').equals('0');
	req.checkBody('password_repeat', 'Passwords do not match').equals(req.body.password);

	errors = req.validationErrors();

	if(errors){
		res.send({"error": errors});
		return;
	}
	utils.db.users.findOne({"email": req.body.email}, {email: 1}, (err, doc) => {
		if(doc){
			res.send({"error": "user already exists"});
		}else{
			bcrypt.genSalt(saltRounds, (err, salt) => {
				bcrypt.hash(req.body.password, salt, (err, hash) => {
					if(err){
						res.send({"error": "error creating user"});
					}else{
						let newUser = {
							"email": req.body.email,
							"screenname": req.body.screenname,
							"admin": req.body.admin,
							"password": hash
						};

						utils.db.users.insert(newUser, (err, result) => {
							if(err){
								res.send({"error": "error saving user, please try again."});
							}else{
								res.send({"email": newUser.email, "screenname": newUser.screenname});
							}
						});
					}

				});
			});
		}
	});
}

exports.createBackUser = (req, res) => {
	let errors;

	req.checkBody('email', 'email is required.').notEmpty();
	req.checkBody('email', 'invalid mail.').isEmail();
	//req.checkBody('screenname', 'Screen Name is required.').notEmpty();
	req.checkBody('password', 'password is required.').notEmpty();
	req.checkBody('password_repeat', 'password confirmation is required.').notEmpty();
	req.checkBody('admin', 'you are not allowed here.').notEmpty();
	req.checkBody('admin', 'you are not allowed this resource.').equals('1');
	req.checkBody('password_repeat', 'passwords do not match').equals(req.body.password);


	errors = req.validationErrors();
	if(errors){
		res.send({"error": errors});
		return;
	}
	utils.db.users.findOne({"email": req.body.email}, {email: 1}, (err, doc)=>{
		if(doc){
			res.send({"error": "Already Existing.."});
		}else{

			bcrypt.genSalt(saltRounds, (err, salt) => {
				bcrypt.hash(req.body.password, salt, (err, hash) => {
					if(err){
						res.send({"error": "Error creating user 1-1"});
					}else{
						let newAdmin = {
							"email": req.body.email,
							"admin": req.body.admin,
							"password": hash
						};

						utils.db.users.insert(newAdmin, (err, result) => {
							if(err){
								res.send({"error": "Error saving user, please try again."});
							}else{
								res.send({"email": newAdmin.email});
							}
						});
					}

				});
			});
		}
	});
}

exports.login = (req, res) => {
	console.log('server login got called..');
	let errors;
	req.checkBody('email', 'Email is Required').notEmpty();
	req.checkBody('password', 'Password is required.').notEmpty();
	console.log("email value: ", req.body.email);
	console.log("password value: ", req.body.password);

	errors = req.validationErrors();
	console.log(errors);

	if(errors){
		console.log('error, reload page with err data..');
		res.render('login', {
			title: 'Sign In',
			errors: errors
		});
		return;
	}
	utils.db.users.findOne({"email": req.body.email}, {email: 1, password: 1, admin: 1, screenname: 1}, (err, doc)=>{
		let output;
		if(err){
			res.render('login', {
				title: 'Sign In',
				errors: 'email address not found on this platform.'
			});
			return;
		}else{
			//req.session.user = doc;
			if( doc == null){
				res.render('login', {
					title: 'Sign In',
					errors: 'you have to sign up first!!!'
				});
				return;
			}else{
				bcrypt.compare(req.body.password, doc.password, (err, resp) => {
					if(resp){
						if(doc.admin == "1"){
							req.session.user = doc;

							res.render('home', {
								errors: ''
							});
							//res.redirect('/home');
							return;
						}
						if(doc.admin == "0"){
							output = {
								"email": doc.email,
								"screenname": doc.screenname,
								"type": "client"
							};
							res.send({"user": output});
							return;
						}
						
					}

					if(err){
						if(doc.admin == "1"){
							res.render('login', {
								title: 'Sign In',
								errors: 'incorrect password.'
							});
							return;
						}
						if(doc.admin == "0"){
							res.send({"error": "incorrect password."});
							return;
						}						
					}
				});
			}
		}
	});
}

exports.getCategory = (req, res) => {

	utils.fetchCategories().then((doc) => {
		console.log('from getCat: ', doc);

		res.send({categories: doc})

	}, (err) => {

		res.send({error: 'error fetching categories'})

	});

}

exports.createCategory = (req, res) => {
	let errors, newCategory;

	req.checkBody('newCategory', 'New category is required.').notEmpty();

	errors = req.validationErrors();
	if (errors){
		res.send({error: errors});
		return;
	}
	utils.db.category.findOne({"categoryname": req.body.newCategory}, (err, doc) => {
		if (doc) {
			res.send({error: 'category already exists!!!'})
			return;
		}

		if (err) {
			res.send({error: err})
			return;
		}

		newCategory = {
			categoryname: req.body.newCategory,
			levels: []
		};

		utils.db.category.insert(newCategory, (err, result) => {
			if(err){
				res.send({error: 'error creating new category, please try again'})
				return;
			}

			if(result){
				utils.fetchCategories().then((doc) => {
					console.log('create newCategory: ', doc);
					res.send({categories: doc})
				}, (err) => {
					console.log('create newCategory: ', err);
					res.send({error: 'error fetching categories' })
				});

			}
		});
	});
}

exports.level = (req, res) => {
	let errors;
	req.checkBody('category', 'category is required.').notEmpty();

	errors = req.validationErrors();

	if (errors){
		res.send({error: errors})
		return;
	}

	utils.fetchLevelByCategory(req.body.category).then((levels)=>{
		//console.log("getLevel resolve", levels);
		res.send({levels: levels})

	}, (err)=>{
		console.log("getLevel reject", err);
		res.send({error: 'error retrieving levels'})

	});


}

exports.createLevel = (req, res) => {
	let errors;
	req.checkBody('category', 'category is required.').notEmpty();
	req.checkBody('newlevel', 'level is required.').notEmpty();

	errors = req.validationErrors();

	if (errors){
		res.send({error: errors})
		return;
	}

	utils.createLevelByCategory(req.body.category, req.body.newlevel).then((level)=>{
		utils.fetchLevelByCategory(req.body.category).then((levelsDoc)=>{
			res.send({levels: levelsDoc})
		}, (err)=>{
			res.send({error: 'error updating levels list'})
		})

	}, (err)=>{
		res.send({error: 'error creating new level in category'})
	})
}

