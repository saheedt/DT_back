'use strict';

//import opened DB connection from server.js
const db = require('../server').db;

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
		db.category.update({"categoryname": category}, { $push: { levels: levelData}}, (err, doc) => {

			if(err){
				reject(err);
				return;
			}

			if(doc){
				categories = doc;
				resolve(doc.levels);
				return;
			}
		});

	});
};

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

	fetchLevelByCategory(req.body.category).then((levels)=>{
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

