window.addEventListener('load', () => {
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
	categorySelect.addEventListener('change', (e)=>{
		let category = {"category": categorySelect.value};

		fetch(location.origin+"/api/level", {
  		method: "POST",
  		headers:{'Content-Type':'application/json'},
  		body: JSON.stringify(category)
		});
	});

	//Add new category on category add button click. 
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


});