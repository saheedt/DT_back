'use strict';

const bcrypt = require('bcrypt'),
      saltRounds = 10,
      utils = require('../utils/utils.js'),
      jwt = require('jsonwebtoken');
require('dotenv').config();
let globToken = '';

//*********view routes*************
exports.showLogin = (req, res) => {
	/*if (req.session.user){
		res.redirect('/home');
		return;
	}*/
	
	res.render('login', {
		title: 'Sign In',
		errors: ''
	});
}

exports.showHome = (req, res) => {
	/*if(!req.session.user){
		res.redirect('/');
		return;
	}*/
	res.render('home', {
		errors: '',
		token:globToken
	});
}

exports.showAdd = (req, res) => {
	/*if(!req.session.user){
		res.redirect('/');
		return;
	}*/
	res.render('add', {
		errors:'',
		category: '',
		level:''
	});
}

exports.showEdit = (req, res) => {
	/*if(!req.session.user){
		res.redirect('/');
		return;
	}*/
	res.render('edit');
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
			res.send({"error": "email address already exists"});
		}else{
			utils.db.users.findOne({"screenname": req.body.screenname}, {screenname: 1}, (screenErr, screenDoc) => {
				if(screenDoc){
					res.send({"error": "screen name already exists"})
				}else{
					bcrypt.genSalt(saltRounds, (saltErr, salt) => {
						if(saltErr){
							res.send({error: "error creating user"})
							return
						}
						bcrypt.hash(req.body.password, salt, (bcryptErr, hash) => {
							if(bcryptErr){
								res.send({"error": "error creating user"});
							}else{
								let newUser = {
									"email": req.body.email,
									"screenname": req.body.screenname,
									"admin": req.body.admin,
									"password": hash,
									"score": 0,
									"answered": []
								},
								toTOk = {
									"email": newUser.email,
									"screenname": newUser.screenname,
									"admin": newUser.admin,
									"password": newUser.password
								};

								utils.db.users.insert(newUser, (insertErr, result) => {
									if(insertErr){
										res.send({"error": "error saving user, please try again."});
									}else{
										jwt.sign(toTOk, process.env.TokenSecret, { expiresIn: '24h' }, (tokErr, token)=>{
											if(tokErr){
												res.send({"error": tokErr})
												return
											}
											if(token){
												let user = {
													"email": newUser.email,
													"screenname": newUser.screenname,
													"type": "client",
													"token": token
												};
												res.send({"user": user})
												return;
											}

										});
									}
								});
							}

						});
					})
				}
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

			bcrypt.genSalt(saltRounds, (saltErr, salt) => {
				if(saltErr){
					res.send({error: "error creating user 1-1"})
					return
				}
				bcrypt.hash(req.body.password, salt, (bcryptErr, hash) => {
					if(bcryptErr){
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

	errors = req.validationErrors();

	if(errors && req.body.isAdmin){
		res.render('login', {
			title: 'Sign In',
			errors: errors
		});
		return;
	}
	if(errors && !req.body.isAdmin){
		res.send({error: errors})
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
			if( doc == null){
				res.render('login', {
					title: 'Sign In',
					errors: 'you have to sign up first!!!'
				});
				return;
			}else{
				bcrypt.compare(req.body.password, doc.password, (cryptErr, resp) => {
					if(resp){
						jwt.sign(doc, process.env.TokenSecret, { expiresIn: '24h' }, (tokErr, token)=>{
						
							if(tokErr && doc.admin == "1"){
								res.render('login', {
									title: 'Sign In',
									errors: tokErr
								});
								return;
							}
							if(tokErr && doc.admin == "0"){
								res.send({"error": tokErr});
								return;
							}
							if(token && doc.admin == "1"){
								/*res.render('home', {
									errors: '',
									token: token
								});*/
								globToken = token
								res.redirect('/home')
								return;
							}
							if(token && doc.admin == "0"){
								output = {
									"email": doc.email,
									"screenname": doc.screenname,
									"type": "client",
									"token": token
								};
								res.send({"user": output});
								return;
							}
						});
					}
					if(cryptErr){
						if(doc.admin == "1"){
							res.render('login', {
								title: 'Sign In',
								errors: 'incorrect password'
							});
							return;
						}
						if(doc.admin == "0"){
							res.send({"error": "incorrect password"});
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
		let sess = req.session;
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

exports.createQuestion = (req, res) => {
	let errors, questionObject;
	req.checkBody('category', 'category is required.').notEmpty();
	req.checkBody('level', 'level is required.').notEmpty();
	req.checkBody('question', 'question is required.').notEmpty();
	req.checkBody('optionA', 'option a is required.').notEmpty();
	req.checkBody('optionB', 'option b is required.').notEmpty();
	req.checkBody('optionC', 'option c is required.').notEmpty();
	req.checkBody('optionD', 'option d is required.').notEmpty();
	req.checkBody('answer', 'answer is required.').notEmpty();

	errors = req.validationErrors();

	if(errors){
		res.send({error: errors})
		return;
	}

	questionObject = {
		category : req.body.category,
		level: req.body.level,
		question: req.body.question,
		optionA: req.body.optionA,
		optionB: req.body.optionB,
		optionC: req.body.optionC,
		optionD: req.body.optionD,
		answer: req.body.answer
	};
	utils.createQuestionByCategoryLevel(questionObject).then((question) =>{
		res.send({pass: "question created"})
	}, (err) =>{
		res.send({error: 'error creating new question'})
	})
}

exports.getQuestions = (req, res) => {
	let errors, questionObject;
	req.checkBody('category', 'category is required.').notEmpty();
	req.checkBody('level', 'level is required.').notEmpty();

	errors = req.validationErrors();

	if(errors){
		res.send({error: errors})
		return;
	}

	questionObject = {
		category: req.body.category,
		level: req.body.level
	};
	utils.getQuestionByCategoryLevel(questionObject).then((questions) =>{
		res.send({questions: questions})
	}, (err) => {
		res.send({error: 'error fetching questions, try again'})
	})

}
exports.updateQuestion = (req, res) => {
	let errors, updateQuestionObject;

	req.checkBody('category', 'category is required.').notEmpty();
	req.checkBody('level', 'level is required.').notEmpty();
	req.checkBody('question', 'question is required.').notEmpty();
	req.checkBody('optionA', 'option a is required.').notEmpty();
	req.checkBody('optionB', 'option b is required.').notEmpty();
	req.checkBody('optionC', 'option c is required.').notEmpty();
	req.checkBody('optionD', 'option d is required.').notEmpty();
	req.checkBody('answer', 'answer is required.').notEmpty();
	req.checkBody('questionId', 'question ID is required.').notEmpty();

	errors = req.validationErrors();

	if(errors){
		res.send({error: errors})
		return;
	}

	updateQuestionObject = {
		category: req.body.category,
		level: req.body.level,
		question: req.body.question,
		optionA: req.body.optionA,
		optionB: req.body.optionB,
		optionC: req.body.optionC,
		optionD: req.body.optionD,
		answer: req.body.answer,
		questionId: req.body.questionId
	};
	utils.updateQuestionByCategoryLevel(updateQuestionObject).then((updatedQuestion) => {
		res.send({updatequestion: updatedQuestion})
	}, (err) => {
		res.send({error: 'error updating question, try again'})
	})
}

exports.addScore = (req, res) =>{
	let errors;
	req.checkBody('email', 'email is required.').notEmpty();
	req.checkBody('score', 'score is required.').notEmpty();

	errors = req.validationErrors();

	if(errors){
		res.send({error: errors})
		return
	}

	utils.addUserScore({email: req.body.email, score: req.body.score }).then((score)=>{
		res.send({score: score})
	},(err)=>{
		res.send({error: 'error updating score'})
	})
}

exports.addToLeaderBoard = (req, res) => {
	let errors;
	req.checkBody('screenname','screen name is required').notEmpty()
	req.checkBody('score','score is required').notEmpty()

	errors = req.validationErrors();

	if(errors){
		res.send({error: errors})
		return
	}

	utils.updateLeaderBoard({screenname: req.body.screenname, score: req.body.score}).then((leader)=>{
		res.send({leader: leader})
	},(err)=>{
		res.send({error: err})
	})
}

exports.answered = (req, res) =>{
	let errors;
	req.checkBody('email','email is required').notEmpty()
	req.checkBody('questionId','question id is required').notEmpty()

	errors = req.validationErrors();

	if(errors){
		res.send({error: errors})
		return
	}

	utils.answered({email: req.body.email, questionId: req.body.questionId}).then((answered)=>{
		res.send({answered: answered})
	},(err)=>{
		res.send({error: err})
	})

}