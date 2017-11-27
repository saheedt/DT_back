'use strict';

const bcrypt = require('bcrypt'),
      saltRounds = 10,
      utils = require('../utils/utils.js'),
      jwt = require('jsonwebtoken');
require('dotenv').config();
let globToken = '', globTokenErr = '', globLoginErr = '';

//*********view routes*************
exports.showLogin = (req, res) => {
	res.render('login', {
		title: 'Sign In',
		errors: globLoginErr
	});
}

exports.showHome = (req, res) => {
	res.render('home', {
		errors: globTokenErr,
		token: globToken
	});
}

exports.showAdd = (req, res) => {
	res.render('add', {
		errors:'',
		category: '',
		level:''
	});
}

exports.showEdit = (req, res) => {
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
		res.json({"error": errors});
		return;
	}
	utils.db.users.findOne({"email": req.body.email}, {email: 1}, (err, doc) => {
		if(doc){
			res.json({"error": "email address already exists"});
		}else{
			utils.db.users.findOne({"screenname": req.body.screenname}, {screenname: 1}, (screenErr, screenDoc) => {
				if(screenDoc){
					res.json({"error": "screen name already exists"})
				}else{
					bcrypt.genSalt(saltRounds, (saltErr, salt) => {
						if(saltErr){
							res.json({error: "error creating user"})
							return
						}
						bcrypt.hash(req.body.password, salt, (bcryptErr, hash) => {
							if(bcryptErr){
								res.json({"error": "error creating user"});
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
									"admin": newUser.admin
								};

								utils.db.users.insert(newUser, (insertErr, result) => {
									if(insertErr){
										res.json({"error": "error saving user, please try again."});
									}else{
										jwt.sign(toTOk, process.env.TokenSecret, { expiresIn: '24h' }, (tokErr, token)=>{
											if(tokErr){
												res.json({"error": tokErr})
												return
											}
											if(token){
												let user = {
													"email": newUser.email,
													"screenname": newUser.screenname,
													"score": newUser.score,
													"answered": newUser.answered,
													"type": "client",
													"token": token
												};
												res.json({"user": user})
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
	req.checkBody('admin', 'you are not allowed this resource.').equals('0');
	req.checkBody('password_repeat', 'passwords do not match').equals(req.body.password);


	errors = req.validationErrors();
	if(errors){
		res.json({"error": errors});
		return;
	}
	utils.db.users.findOne({"email": req.body.email}, {email: 1}, (err, doc)=>{
		if(doc){
			res.json({"error": "Already Existing.."});
		}else{

			bcrypt.genSalt(saltRounds, (saltErr, salt) => {
				if(saltErr){
					res.json({error: "error creating user 1-1"})
					return
				}
				bcrypt.hash(req.body.password, salt, (bcryptErr, hash) => {
					if(bcryptErr){
						res.json({"error": "Error creating user 1-1"});
					}else{
						let newAdmin = {
							"email": req.body.email,
							"admin": req.body.admin,
							"password": hash
						};

						utils.db.users.insert(newAdmin, (err, result) => {
							if(err){
								res.json({"error": "Error saving user, please try again."});
							}else{
								res.json({"email": newAdmin.email});
							}
						});
					}

				});
			});
		}
	});
}

exports.login = (req, res) => {
	let errors;
	req.checkBody('email', 'Email is Required').notEmpty();
	req.checkBody('password', 'Password is required.').notEmpty();

	errors = req.validationErrors();

	if(errors && req.body.isAdmin){
		globLoginErr = errors
		res.redirect('/')
		return;
	}
	if(errors && !req.body.isAdmin){
		res.json({error: errors})
		return;
	}
	utils.db.users.findOne({"email": req.body.email}, {email: 1, password: 1, admin: 1, screenname: 1, score: 1, answered : 1}, (err, doc)=>{
		let output;
		if(err){
			if(req.body.isAdmin){
				globLoginErr = 'email address not found on this platform'
				res.redirect('/')
				return;
			}
			res.json({error: 'email address not found on this platform'})			
		}else{
			if( doc == null){
				if(req.body.isAdmin){
					globLoginErr = 'you have to sign up first!!!'
					res.redirect('/')
					return
				}
				res.json({error: 'you have to sign up first!!!'})
			}else{
				bcrypt.compare(req.body.password, doc.password, (cryptErr, resp) => {

					if(cryptErr){
						if(doc.admin == "1"){
							globLoginErr =  'incorrect password'
							res.redirect('/')
							return;
						}
						if(doc.admin == "0"){
							res.json({"error": "incorrect password"});
							return;
						}						
					}
					
					if(resp){
						let toTok = {
							"email": doc.email,
							"screenname": doc.screenname,
							"admin": doc.admin
						};
						jwt.sign(toTok, process.env.TokenSecret, { expiresIn: '24h' }, (tokErr, token)=>{
						
							if(tokErr && doc.admin == "1"){
								globLoginErr = tokErr
								res.redirect('/')
								return;
							}
							if(tokErr && doc.admin == "0"){
								res.json({"error": tokErr});
								return;
							}
							if(token && doc.admin == "1"){
								globToken = token
								res.redirect('/home')
								return;
							}
							if(token && doc.admin == "0"){
								output = {
									"email": doc.email,
									"screenname": doc.screenname,
									"type": "client",
									"score": doc.score,
									"answered": doc.answered,
									"token": token
								};
								res.json({"user": output});
								return;
							}
						});
					}
				});
			}
		}
	});
}

exports.getCategory = (req, res) => {
	utils.fetchCategories().then((doc) => {
		res.json({categories: doc})
	}, (err) => {
		res.json({error: 'error fetching categories'})
	});
}

exports.createCategory = (req, res) => {
	let errors, newCategory;

	req.checkBody('newCategory', 'New category is required.').notEmpty();

	errors = req.validationErrors();
	if (errors){
		res.json({error: errors});
		return;
	}
	utils.db.category.findOne({"categoryname": req.body.newCategory}, (err, doc) => {
		if (doc) {
			res.json({error: 'category already exists!!!'})
			return;
		}

		if (err) {
			res.json({error: err})
			return;
		}

		newCategory = {
			categoryname: req.body.newCategory,
			levels: []
		};

		utils.db.category.insert(newCategory, (err, result) => {
			if(err){
				res.json({error: 'error creating new category, please try again'})
				return;
			}

			if(result){
				utils.fetchCategories().then((doc) => {
					res.json({categories: doc})
				}, (err) => {
					res.json({error: 'error fetching categories' })
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
		res.json({error: errors})
		return;
	}

	utils.fetchLevelByCategory(req.body.category).then((levels)=>{
		
		res.json({levels: levels})

	}, (err)=>{
		res.json({error: 'error retrieving levels'})

	});


}

exports.createLevel = (req, res) => {
	let errors;
	req.checkBody('category', 'category is required.').notEmpty();
	req.checkBody('newlevel', 'level is required.').notEmpty();

	errors = req.validationErrors();

	if (errors){
		res.json({error: errors})
		return;
	}

	utils.createLevelByCategory(req.body.category, req.body.newlevel).then((level)=>{
		utils.fetchLevelByCategory(req.body.category).then((levelsDoc)=>{
			res.json({levels: levelsDoc})
		}, (err)=>{
			res.json({error: 'error updating levels list'})
		})

	}, (err)=>{
		res.json({error: 'error creating new level in category'})
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
		res.json({error: errors})
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
		res.json({pass: "question created"})
	}, (err) =>{
		res.json({error: 'error creating new question'})
	})
}

exports.getQuestions = (req, res) => {
	let errors, questionObject;
	req.checkBody('category', 'category is required.').notEmpty();
	req.checkBody('level', 'level is required.').notEmpty();

	errors = req.validationErrors();

	if(errors){
		res.json({error: errors})
		return;
	}

	questionObject = {
		category: req.body.category,
		level: req.body.level
	};
	utils.getQuestionByCategoryLevel(questionObject).then((questions) =>{
		res.json({questions: questions})
	}, (err) => {
		res.json({error: 'error fetching questions, try again'})
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
		res.json({error: errors})
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
		res.json({updatequestion: updatedQuestion})
	}, (err) => {
		res.json({error: 'error updating question, try again'})
	})
}

exports.addScore = (req, res) =>{
	let errors;
	req.checkBody('email', 'email is required.').notEmpty();
	req.checkBody('score', 'score is required.').notEmpty();

	errors = req.validationErrors();

	if(errors){
		res.json({error: errors})
		return
	}

	utils.addUserScore({email: req.body.email, score: req.body.score }).then((score)=>{
		res.json({score: score})
	},(err)=>{
		res.json({error: 'error updating score'})
	})
}

exports.addToLeaderBoard = (req, res) => {
	let errors;
	req.checkBody('screenname','screen name is required').notEmpty()
	req.checkBody('score','score is required').notEmpty()

	errors = req.validationErrors();

	if(errors){
		res.json({error: errors})
		return
	}

	utils.updateLeaderBoard({screenname: req.body.screenname, score: req.body.score}).then((leader)=>{
		res.json({leader: leader})
	},(err)=>{
		res.json({error: err})
	})
}

exports.answered = (req, res) =>{
	let errors;
	req.checkBody('email','email is required').notEmpty()
	req.checkBody('questionId','question id is required').notEmpty()

	errors = req.validationErrors();

	if(errors){
		res.json({error: errors})
		return
	}

	utils.answered({email: req.body.email, questionId: req.body.questionId}).then((answered)=>{
		res.json({answered: answered})
	},(err)=>{
		res.json({error: err})
	})

}