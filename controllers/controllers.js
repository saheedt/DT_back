'use strict';

//import opened DB connection from server.js
const db = require('../server').db;
const bcrypt = require('bcrypt');
const saltRounds = 10;

let categories, levels;

const fetchCategories = () => {
	return new Promise((resolve, reject) => {

		db.category.find({}, {levels: 0}, (err, doc) => {

			if(err){
				reject(err);
				return;
			}

			if(doc){
				categories = doc;
				resolve(doc);
				return;
			}
		});

	});

};

const fetchLevelByCategory = (category) => {
	return new Promise((resolve, reject) => {

		db.category.findOne({"categoryname": category}, {levels: 1}, (err, doc) => {

			if(err){
				reject(err);
				return;
			}

			if(doc){
				levels = doc.levels;
				resolve(doc.levels);
				return;
			}
		});

	});
};

const createLevelByCategory = (category, newLevel) => {
	let levelData = {
		"levelname": newLevel,
		"questions": []
	};

	return new Promise((resolve, reject) => {
		db.category.update({"categoryname": category}, { $push: { "levels": levelData}}, (err, doc) => {

			if(err){
				reject(err);
				return;
			}

			if(doc){
				//categories = doc;
				resolve(doc);
				return;
			}
		});

	});
};


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
	/*if(!req.session.user){
		res.redirect('/');
		return;
	}*/
	res.render('home', {
		errors: ''
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


//*********api routes****************

exports.createUser = (req, res) => {
	//db.users.
	let errors;
	req.checkBody('email', 'Email is required.').notEmpty();
	req.checkBody('screenname', 'Screen Name is required.').notEmpty();
	req.checkBody('password', 'Password is required.').notEmpty();
	req.checkBody('password_repeat', 'Password confirmation is required.').notEmpty();
	req.checkBody('admin', 'You are not allowed here.').notEmpty();
	req.checkBody('admin', 'You are not allowed this resource.').equals(0);
	req.checkBody('password_repeat', 'Passwords do not match').equals(req.body.password);

	errors = req.validationErrors();

	if(errors){
		res.send({"error": errors});
		return;
	}
	db.users.findOne({"email": req.body.email}, {email: 1}, (err, doc) => {
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

						db.users.insert(newUser, (err, result) => {
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

	req.checkBody('email', 'Email is required.').notEmpty();
	//req.checkBody('screenname', 'Screen Name is required.').notEmpty();
	req.checkBody('password', 'Password is required.').notEmpty();
	req.checkBody('password_repeat', 'Password confirmation is required.').notEmpty();
	req.checkBody('admin', 'You are not allowed here.').notEmpty();
	req.checkBody('admin', 'You are not allowed this resource.').equals(1);
	req.checkBody('password_repeat', 'Passwords do not match').equals(req.body.password);


	errors = req.validationErrors();
	if(errors){
		res.send({"error": errors});
		return;
	}
	db.users.findOne({"email": req.body.email}, {email: 1}, (err, doc)=>{
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

						db.users.insert(newAdmin, (err, result) => {
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
	let errors;
	req.checkBody('email', 'Email is Required').notEmpty();
	req.checkBody('password', 'Password is required.').notEmpty();

	errors = req.validationErrors();

	

}

exports.getCategory = (req, res) => {
	/*db.category.find({}, {levels: 0}, (err, doc) => {
		if(err){
			res.render('add', {
				//title: 'Add New Questions.',
				errors: 'Error fetching categories, please reload page.'
			});
				return;
		}

		categories = doc;

		res.render('add', {
			//title: 'Add New Questions.',
			errors: '',
			category: categories
		})
	});*/

	fetchCategories().then((doc) => {
		console.log('getcategory: ', doc);
		res.render('add', {
			errors: '',
			category: categories
		});
	}, (err) => {
		console.log('getcategory: ', err);
		res.render('add', {
			errors: 'Error fetching categories .'
		})
	});

}

exports.createCategory = (req, res) => {
	let errors, newCategory;
	if(!req.session.user){
		res.redirect('/');
		return;
	}

	req.checkBody('newCategory', 'New category is required.').notEmpty();

	errors = req.validationErrors();
	if (errors){
		res.render('add', {
			category: categories,
			errors: errors
		});
		return;
	}
	db.category.findOne({"categoryname": req.body.newCategory}, (err, doc) => {
		if (doc) {
			res.render('add', {
				category: categories,
				errors: 'Category Already Exists!!!'
			});
			return;
		}

		if (err) {
			res.render('add', {
				category: categories,
				errors: err
			});
			return;
		}

		newCategory = {
			categoryname: req.body.newCategory,
			levels: []
		};

		db.category.insert(newCategory, (err, result) => {
			if(err){
				res.render('add', {
					category: categories,
					errors: 'Error creating new category, please try again.'
				});
				return;
			}

			if(result){
				fetchCategories().then((doc) => {
					console.log('create newCategory: ', doc);
					res.render('add', {
						errors: '',
						category: categories
					});
				}, (err) => {
					console.log('create newCategory: ', err);
					res.render('add', {
						errors: 'Error fetching categories .'
					});
				}
				);

			}
			/*db.category.find({}, {levels: 0}, (err, doc) => {

				let categoryDisplay = [] ;

				if(err){
					res.render('add', {
						//title: 'Add New Questions.',
						errors: 'Error fetching categories, please reload page.'
					});
					return;
				}

				doc.map((data)=>{
					if(data.categoryname){
						categoryDisplay.push(data.categoryname);
					}
				});

				res.render('add', {
					//title: 'Add New Questions.',
					errors: '',
					category: (categoryDisplay.length > 1) ? categoryDisplay : (categoryDisplay.length === 1) ? categoryDisplay[0] : (categoryDisplay.length == 0) ? ''
					level: doc.
				})
			});*/
		});
	});
}

exports.level = (req, res) => {
	let errors;
	req.checkBody('category', 'category is required.').notEmpty();

	errors = req.validationErrors();

	if (errors){
		res.render('add', {
			category: categories,
			errors: errors
		});
		return;
	}

	fetchLevelByCategory(req.body.category).then((level)=>{
		console.log("getLevel resolve", levels);
		res.render('add', {
			category: categories,
			level: levels,
			errors: ''
		});

	}, (err)=>{
		console.log("getLevel reject", err);
		res.render('add', {
			category: categories,
			//level: levels,
			errors: 'Error retrieving levels.'
		});

	});


}

exports.createLevel = (req, res) => {
	let errors;
	req.checkBody('category', 'category is required.').notEmpty();
	req.checkBody('newlevel', 'level is required.').notEmpty();

	errors = req.validationErrors();

	if (errors){
		res.render('add', {
			category: categories,
			errors: errors
		});
		return;
	}

	createLevelByCategory(req.body.category, req.body.newlevel).then((level)=>{

		fetchLevelByCategory(req.body.category).then((doc)=>{
			console.log("getLevel in createLevelByCategory resolve", levels);
			res.render('add', {
				category: categories,
				level: levels,
				errors: ''
			});

		}, (err)=>{
			console.log("getLevel in createLevelByCategory reject", err);
			res.render('add', {
				category: categories,
				level: levels,
				errors: 'Error updating levels list.'
			});

		});
	}, (err)=>{
		console.log("createLevelByCategory reject", err);
		res.render('add', {
			category: categories,
			level: levels,
			errors: 'Error creating new level in category.'
		});
	});
}

