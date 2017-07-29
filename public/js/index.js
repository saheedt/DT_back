window.addEventListener('load', ()=>{

	const getCategory = () =>{

		const form = document.createElement("form");
			  form.setAttribute("method", "get");
			  form.setAttribute("action", '/api/category');

		document.body.appendChild(form);
		form.submit();
		document.body.removeChild(form);
	};

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

		getCategory();

	categorySelect.addEventListener('change', (e)=>{
		let category = {"category": categorySelect.value};

		const form = document.createElement("form");
			  form.setAttribute("method", "post");
			  form.setAttribute("action", '/api/level');

		const input = document.createElement('input');
			  input.type = 'hidden';
			  input.name = "category";
			  input.value = category.category;

		form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
		document.body.removeChild(form);
		return false;
		/*fetch(location.origin+"/api/level", {
  		method: "POST",
  		headers:{'Content-Type':'application/json'},
  		body: JSON.stringify(category)
		});*/
	});
	}

	//Add new category on category add button click.
	if(newCategoryBtn){
	newCategoryBtn.addEventListener('click', (e)=>{
		let catData = {
			"newCategory" : newCategory.value
		};
		const form = document.createElement("form");
			  form.setAttribute("method", "post");
			  form.setAttribute("action", '/api/createcategory');

		const input = document.createElement('input');
			  input.type = 'hidden';
			  input.name = "newCategory";
			  input.value = catData.newCategory;

		form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
		document.body.removeChild(form);
		return false;

		/*fetch(location.origin+"/api/createcategory", {
  		method: "POST",
  		headers:{'Content-Type':'application/json'},
  		body: JSON.stringify(catData)
		});*/
	});
	}

	if(newLevelBtn){
	newLevelBtn.addEventListener('click', (e)=>{
		let levdata = {
			"category": categorySelect.value,
			"levdata": newLevel.value
		};

		const form = document.createElement("form");
			  form.setAttribute("method", "post");
			  form.setAttribute("action", '/api/createlevel');

		const input = document.createElement('input');
			  input.type = 'hidden';
			  input.name = "category";
			  input.value = levdata.category;

		const input2 = document.createElement('input');
			  input2.type = 'hidden';
			  input2.name = "newlevel";
			  input2.value = levdata.levdata;

		form.appendChild(input);
		form.appendChild(input2);
		document.body.appendChild(form);
		form.submit();
		document.body.removeChild(form);
		return false;

		/*fetch(location.origin+"/api/createlevel", {
  			method: "POST",
  			headers:{'Content-Type':'application/json'},
  			body: JSON.stringify(levdata)
		});*/
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

			const form = document.createElement("form");
			  form.setAttribute("method", "post");
			  form.setAttribute("action", '/api/login');

			const input = document.createElement('input');
			  input.type = 'hidden';
			  input.name = "email";
			  input.value = logindata.email;

			const input2 = document.createElement('input');
			  input2.type = 'hidden';
			  input2.name = "password";
			  input2.value = logindata.password;

			form.appendChild(input);
			form.appendChild(input2);
			document.body.appendChild(form);
			form.submit();
			document.body.removeChild(form);
			return false;

			/*fetch(location.origin+'/api/login',{
				method: 'POST',
				//headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(logindata)
			}).then((response) =>{
				return response.json();
			}).then((resp) => {
				console.log(resp)
			});*/
		});
		}


let insertedNodes = [];
const observer = new MutationObserver(function(mutations) {
 mutations.forEach(function(mutation) {
   for (var i = 0; i < mutation.addedNodes.length; i++)
     insertedNodes.push(mutation.addedNodes[i]);
 })
});
observer.observe(document, { attributes: true, childList: true, characterData: true  });
console.log(insertedNodes);


});


