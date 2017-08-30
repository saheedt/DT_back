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
					
					resolve(categories);
					return;
				}
				doc.map((data, idx)=>{
					
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

exports.createQuestionByCategoryLevel = (questionObject) => {
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

exports.getQuestionByCategoryLevel = (getQuestionObject) => {
	let output = [];

	return new Promise((resolve, reject) => {
		db.category.findOne({ categoryname: getQuestionObject.category, 'levels.levelname': getQuestionObject.level }, { _id: 0, categoryname: 0},
			(err, doc) =>{
				if(err){
					reject(err);
					return;
				}

				if(doc){
					doc.levels.map((data, idx)=>{
						if(data.levelname == getQuestionObject.level){
							return output.push(data);
						}
					});
					resolve(output);
					return;
				}

		});
	});

}

exports.updateQuestionByCategoryLevel = (upQstnObj) =>{
	let setter = {
		question: upQstnObj.question,
		optionA: upQstnObj.optionA,
		optionB: upQstnObj.optionB,
		optionC: upQstnObj.optionC,
		optionD: upQstnObj.optionD,
		answer: upQstnObj.answer,
		questionId: upQstnObj.questionId
	}, toSet;

	return new Promise((resolve, reject) => {
		db.category.findOne({categoryname: upQstnObj.category},{levels: 1}, (err, doc)=>{
			if(err){
				reject(err)
				return;
			}
			if(doc){
				doc.levels.map((data, idx)=>{
					if(data.levelname === upQstnObj.level){
						data.questions.map((innerData, innerIdx)=>{
							if(innerData.questionId === upQstnObj.questionId){
								toSet = 'levels.'+idx+'.questions.'+innerIdx
								db.category.update({levels: { $elemMatch:{ questions: {$elemMatch:{questionId: upQstnObj.questionId}}}}}, {$set: {[`${toSet}`]: setter} }, (err, doc)=>{
									if(err){
										reject(err)
										return;
									}
									if(doc){
										resolve(doc)
										return;
									}
								});
							}
						});
					}
				});
			}
		});
	});
}

exports.addUserScore = (scoreUpdateData) => {

	return new Promise((resolve, reject) => {
		db.users.update({email: scoreUpdateData.email}, {$inc: { score: scoreUpdateData.score } },(err, doc)=>{
			if(err){
				reject(err)
				return
			}
			if(doc){
				resolve(doc)
				return
			}
		});
	});
}

exports.updateLeaderBoard = (leaderBoardUpdateData) => {
	return new Promise((resolve, reject) => {
		db.leaderboard.findOne({screenname: leaderBoardUpdateData.screenname}, (err, doc) => {

			if (err){
				reject(err)
				return
			}
			
			if(doc){
				db.leaderboard.update({screenname: leaderBoardUpdateData.screenname}, {$set:{score: leaderBoardUpdateData.score}}, (updateErr, updateDoc)=>{
					if(updateErr){
						reject(updateErr)
						return
					}
					if(updateDoc){
						resolve(updateDoc)
						return
					}
				})
			}else{
				db.leaderboard.insert({screenname: leaderBoardUpdateData.screenname, score: leaderBoardUpdateData.score}, (insertErr, insertDoc) => {
					if(insertErr){
						reject(insertErr)
						return
					}
					if(insertDoc){
						resolve(insertDoc)
						return
					}
				})
			}
		})
	});
}

exports.answered = (answeredData) =>{
	let found = false;
	return new Promise((resolve, reject) => {
		db.users.findOne({"email": answeredData.email}, {answered: 1}, (err, doc) => {

			if(err){
				reject(err)
				return
			}

			if(doc){
				doc.map((data, idx) => {
					if(found === true){
						return;
					}
					if(data == answeredData.questionId){
						found = true
						return
					}					
				})
				if(found === true){
					db.users.update({"email": answeredData.email}, {$push: {answered: answeredData.questionId}}, (updateErr, updateDoc) => {
						if(updateErr){
							found = false
							reject(updateErr)
							return
						}
						if(updateDoc){
							found = false
							resolve(updateDoc)
							return
						}
					});
				}
			}

		});
	});
}

