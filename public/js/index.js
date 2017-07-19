window.addEventListener('load', () => {

	//**********Add page************
	let newCategory = document.getElementById('newCat'),
		categorySelect = document.getElementById('categorySelect');
		newLevel = document.getElementById('newLev'),
		question = document.getElementById('newQuestn'),
		optionA = document.getElementById('optnA'),
		optionB = document.getElementById('optnB'),
		optionC = document.getElementById('optnC'),
		optionD = document.getElementById('optnD'),
		answer = document.getElementById('answer');


	let newCategoryBtn = document.getElementById('newCatBtn'),
		newLevelBtn = document.getElementById('newLevBtn'),
		submitQuestionBtn = document.getElementById('questnSubmitBtn');

	//fetch level on category select change..
	if(categorySelect){
	categorySelect.addEventListener('change', (e)=>{
		let category = {"category": categorySelect.value};

		fetch(location.origin+"/api/level", {
  		method: "POST",
  		headers:{'Content-Type':'application/json'},
  		body: JSON.stringify(category)
		});
	});
	}

	//Add new category on category add button click.
	if(newCategoryBtn){
	newCategoryBtn.addEventListener('click', (e)=>{
		let catData = {
			"newCategory" : newCategory.value
		};

		fetch(location.origin+"/api/createcategory", {
  		method: "POST",
  		headers:{'Content-Type':'application/json'},
  		body: JSON.stringify(catData)
		});
	});
	}

	if(newLevelBtn){
	newLevelBtn.addEventListener('click', (e)=>{
		let levdata = {
			"category": categorySelect.value,
			"newlevel": newLevel.value
		};

		fetch(location.origin+"/api/createlevel", {
  			method: "POST",
  			headers:{'Content-Type':'application/json'},
  			body: JSON.stringify(levdata)
		});
	});
	}


	//***********login page*********

	let loginform = document.getElementById('loginform'),
		loginEmail = document.getElementById('loginEmail'),
		loginPassword = document.getElementById('loginPassword');

		if(loginform){
		loginform.addEventListener('submit', (e) => {
			e.preventDefault();
			console.log('login command got called in index.js..');
			let logindata = {
				"email": loginEmail.value,
				"password": loginPassword.value
			}
			console.log(logindata);
			fetch(location.origin+'/api/login',{
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(logindata)
			}).then((response) =>{
				
			});
		});
		}

});


