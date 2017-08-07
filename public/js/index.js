window.addEventListener('load', ()=>{
	const getCategory = () =>{
		const catSelect = document.getElementById('categorySelect');
		let categories = '';

		fetch("/api/category", {
  		method: "POST",
  		headers:{'Content-Type':'application/json'}
		}).then((resp)=>{
			resp.json().then((res) =>{
				if(res.categories){
					if(res.categories.length <= 0){
						catSelect.disabled = true;
						$(catSelect).empty();
						$(catSelect).append("<option value=''> --Select Category-- </option>");
						catSelect.disabled = false;
						return;
					}
					catSelect.disabled = true;
					$.each(res.categories, (idx, data)=>{
						categories += `<option value=${data.categoryname} > ${data.categoryname} </option>`;
					})
					$(catSelect).append(categories);
					catSelect.disabled = false;
					return;
				}
				if(res.error){
					//TODO: Handle error
				}
				
				
			})
		});
		
	};

	//**********Add page************
	let newCategory = document.getElementById('newCat'),
		categorySelect = document.getElementById('categorySelect');
		levelSelect = document.getElementById('levelSelect');
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
		let category = {"category": categorySelect.value}, levels = '';

		fetch("api/level", {
  		method: "POST",
  		headers:{'Content-Type':'application/json'},
  		body: JSON.stringify(category)
		}).then((resp)=>{
			resp.json().then((res)=>{
				if(res.levels){
					if(res.levels.length <= 0){
						levelSelect.disabled = true;
						$(levelSelect).empty();
						$(levelSelect).append("<option value=''> --Select Level-- </option>");
						levelSelect.disabled = false;
						return;
					}
					levelSelect.disabled = true;
					$(levelSelect).empty();
					levels += "<option value=''> --Select Level-- </option>";
					$.each(res.levels, (idx, data)=>{
						let show = data.split('_').join(' ');
						levels += `<option value=${data} > ${show} </option>`;
					})
					$(levelSelect).append(levels);
					levelSelect.disabled = false;
					return;
				}
				if(res.error){
					//TODO: Handle error
				}
			})
		});
	});
	}

	//Add new category on category add button click.
	if(newCategoryBtn){
	newCategoryBtn.addEventListener('click', (e)=>{
		let catData = {
			"newCategory" : newCategory.value
		}, categories = '';

		fetch("/api/createcategory", {
  		method: "POST",
  		headers:{'Content-Type':'application/json'},
  		body: JSON.stringify(catData)
		}).then((resp)=>{
			resp.json().then((res)=>{
				if(res.categories){
					newCategory.disabled = true
					$(categorySelect).empty();
					categories += "<option value=''> --Select Category-- </option>";
					$.each(res.categories, (idx, data)=>{
						categories += `<option value=${data.categoryname} > ${data.categoryname} </option>`;
					})
					$(categorySelect).append(categories);
					newCategory.value = '';
					newCategory.disabled = false;
					return;
				}
				if(res.error){
					//TODO: Handle error
				}
				
			})
		});
	});
	}

	if(newLevelBtn){
	newLevelBtn.addEventListener('click', (e)=>{
		let levdata = {
			"category": categorySelect.value,
			"newlevel": newLevel.value
		}, levels = '';

		fetch("api/createlevel", {
  			method: "POST",
  			headers:{'Content-Type':'application/json'},
  			body: JSON.stringify(levdata)
		}).then((resp)=>{
			resp.json().then((res)=>{			
				if(res.levels){
					newLevel.disabled = true;
					$(levelSelect).empty();
					levels += "<option value=''> --Select Level-- </option>";
					$.each(res.levels, (idx, data)=>{
						let show = data.split('_').join(' ');
						levels += `<option value=${data} > ${show} </option>`;
					})
					$(levelSelect).append(levels);
					newLevel.value = '';
					newLevel.disabled = false;
					return;
				}
				if(res.error){
					//TODO: Handle error
				}
				
			})
		});
	});
	}

	if(submitQuestionBtn){
			//newQuestn //optnA //optnB //optnC //optnD //answer
			submitQuestionBtn.addEventListener('click', (e)=>{

				let questionObject = {
					category: categorySelect.value,
					level: levelSelect.value,
					question: question.value,
					optionA: optionA.value,
					optionB: optionB.value,
					optionC: optionC.value,
					optionD: optionD.value,
					answer: answer.value
				};
				console.log(questionObject);

				fetch("/api/createquestion", {
					method: "POST",
  					headers:{'Content-Type':'application/json'},
  					body: JSON.stringify(questionObject)
				}).then((resp) => {
					resp.json().then((res) => {
						console.log(res);
						if(res.pass == "question created"){
							question.value = '';
							optionA.value = '';
							optionB.value = '';
							optionC.value = '';
							optionD.value = '';
							answer.value = '';
						}
						
					});
				});
			})
		//});
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
			});
		}

});


