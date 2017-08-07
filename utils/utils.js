'use strict';

const mongojs = require('mongojs'),
	  uuidv4 = require('uuid/v4');
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

exports.createQuestionByCategoryLevel = (questionObject) =>{
	let uuid = uuidv4().split("-")[0],
		levsplit = questionObject.level.split('_'),
		questionId = `${questionObject.category.substr(0,3)}${levsplit[0].substr(0,3)}${levsplit[1]}-${uuid}`;
		
	let questionObj = {
		question: questionObject.question,
		optionA: questionObject.optionA,
		optionB: questionObject.optionB,
		optionC: questionObject.optionC,
		optionD: questionObject.optionD,
		answer: questionObject.answer,
		questionId: questionId
	}

	return new Promise((resolve, reject) => {

		db.category.findAndModify({ query: {'categoryname': questionObject.category, 'levels.levelname': questionObject.level}, update: {$push: {'levels.$.questions': questionObj}}},
			(err, doc)=>{
				if(err){
					reject(err);
					return;
				}
				if(doc){
					resolve(doc);
					return;
				}
			});
	});
}