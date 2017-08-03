'use strict';

const mongojs = require('mongojs');
      require('dotenv').config();

let categories = [];
//DB connection
const db = exports.db = mongojs(process.env.DBConnectString,
	[process.env.UsersCollection, process.env.LeaderboardCollection, 
	process.env.CategoryCollection, process.env.SessionCollection]);

db.on('connect', ()=>{
	console.log('database connected');
});
db.on('error', (err)=>{
	console.log('database error', err);
});



//******* Helper functions *********
exports.fetchCategories = () => {
	console.log('got called..');
	return new Promise((resolve, reject) => {

		db.category.find({}, {levels: 0}, (err, doc) => {

			if(err){
				reject(err);
				return;
			}

			if(doc){
				let present;
				if(categories.length <= 0){
					doc.map((data)=>{categories.push(data)});
					console.log('fetched cats on first iter: ', categories)
					resolve(categories);
					return;
				}
				doc.map((data, idx)=>{
					console.log('doc map: ', idx, data)
					present = false;
					
					
				for(let i = 0; i < categories.length; i++){

					if(data.categoryname === categories[i].categoryname){
						present = true;
						return;
					}
				}
				if(present === false){
					categories.push(data);
				}

				});
				console.log('fetched cats: ', categories)
				resolve(categories);
				return;
			}
		});

	});

};

exports.fetchLevelByCategory = (category) => {
	let levelname = [];
	return new Promise((resolve, reject) => {

		db.category.findOne({"categoryname": category}, {levels: 1}, (err, doc) => {

			if(err){
				reject(err);
				return;
			}

			if(doc){
				//levels = 
				doc.levels.map((data, idx) => {
					levelname.push(data.levelname);
				})
				resolve(levelname)
				return;
			}
		});

	});
};

exports.createLevelByCategory = (category, newLevel) => {
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
				//categories = doc;
				resolve(doc);
				return;
			}
		});

	});
};