window.addEventListener('load', ()=>{
	
	const errorDisplay = document.getElementById('errorContainer');
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
					errorDisplay.innerHTML = res.error;
				}
				
				
			})
		});
		
	};

	//**********Add and edit page************
	let newCategory = document.getElementById('newCat'),
		categorySelect = document.getElementById('categorySelect');
		levelSelect = document.getElementById('levelSelect');
		newLevel = document.getElementById('newLev'),
		question = document.getElementById('newQuestn'),
		optionA = document.getElementById('optnA'),
		optionB = document.getElementById('optnB'),
		optionC = document.getElementById('optnC'),
		optionD = document.getElementById('optnD'),
		answer = document.getElementById('answer'),
		pullQuestions = document.getElementById('pullQuestionsBtn');



	let newCategoryBtn = document.getElementById('newCatBtn'),
		newLevelBtn = document.getElementById('newLevBtn'),
		submitQuestionBtn = document.getElementById('questnSubmitBtn');


	//fetch level on category select change..
	if(categorySelect){

		getCategory();

	categorySelect.addEventListener('change', (e)=>{

		if(categorySelect.value == '' || categorySelect.value == ' '){
			errorDisplay.innerHTML = 'select valid category';
			return;
		}

		let category = {"category": categorySelect.value}, levels = '';
		errorDisplay.innerHTML = '';

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
					errorDisplay.innerHTML = res.error;
				}
			})
		});
	});
	}

	//Add new category on category add button click.
	if(newCategoryBtn){
		document.getElementById('headerAddBtn').style.display = 'none';

	newCategoryBtn.addEventListener('click', (e)=>{

		if(newCategory.value == '' || newCategory.value == ' '){
			errorDisplay.innerHTML = 'come on, do better with the category name!';
			//$('#errorContainer').html('come on, do better with the category name!');
			return;
		}

		let catData = {
			"newCategory" : newCategory.value
		}, categories = '';

		errorDisplay.innerHTML = '';

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
					errorDisplay.innerHTML = res.error;
				}
				
			})
		});
	});
	}

	if(newLevelBtn){
	newLevelBtn.addEventListener('click', (e)=>{
		if(categorySelect.value == '' || categorySelect.value == ' '){
			errorDisplay.innerHTML = 'check selected category bruh!';
			return;
		}
		if(newLevel.value == '' || newLevel.value == ' '){
			errorDisplay.innerHTML = 'come on, do better with the level name!';
			return;
		}
		let levdata = {
			"category": categorySelect.value,
			"newlevel": newLevel.value
		}, levels = '';

		errorDisplay.innerHTML = '';

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
					errorDisplay.innerHTML = res.error;
				}
				
			})
		});
	});
	}

	if(levelSelect){
		levelSelect.addEventListener('change', (e)=>{
			if(levelSelect.value == '' || levelSelect.value == ' '){
				errorDisplay.innerHTML = 'check selected level bruh!'
				return;
			}
			errorDisplay.innerHTML = '';
		});
	}

	if(submitQuestionBtn){
			//newQuestn //optnA //optnB //optnC //optnD //answer
			submitQuestionBtn.addEventListener('click', (e)=>{
				if(categorySelect.value == '' || categorySelect.value == ' ' || levelSelect.value == '' || levelSelect.value == ' '
					|| question.value == '' || question.value == ' ' || optionA.value == '' || optionA.value == ' ' || optionB.value == '' 
					|| optionB.value == ' ' || optionC.value == '' || optionC.value == ' ' || optionD.value == '' || optionD.value == ' '
					|| answer.value == '' || answer.value == ' '){

					errorDisplay.innerHTML = 'bruhh!! walk your way up to spot your wrong doing';
					return;
				}

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
				errorDisplay.innerHTML = '';

				fetch("/api/createquestion", {
					method: "POST",
  					headers:{'Content-Type':'application/json'},
  					body: JSON.stringify(questionObject)
				}).then((resp) => {
					resp.json().then((res) => {
						//console.log(res);
						if(res.pass == "question created"){
							question.value = '';
							optionA.value = '';
							optionB.value = '';
							optionC.value = '';
							optionD.value = '';
							answer.value = '';
							return;
						}
						if(res.error){
							errorDisplay.innerHTML = res.error;
							return;
						}
						
					});
				});
			})
		//});
	}

	if(pullQuestions){
		
		pullQuestions.addEventListener('click', (e)=>{
			let questionObj, tableData = '' /*, questionTable = document.getElementById('questionTable')*/;
			if(categorySelect.value == '' || categorySelect.value == ' '){
				errorDisplay.innerHTML = 'check selected category bruh';
				return;
			}
			if(levelSelect.value == '' || levelSelect.value == ' '){
				errorDisplay.innerHTML = 'check selected level bruh';
				return;
			}
			questionObj = {
				category: categorySelect.value,
				level: levelSelect.value
			};
			fetch("api/question", {
				method: "POST",
				headers:{'Content-Type':'application/json'},
				body: JSON.stringify(questionObj)
			}).then((resp) =>{
				resp.json().then((res)=>{
					if(res.questions){
						res.questions[0].questions.map((data, idx) =>{
							tableData += `<tr>
							<td><input type="text" class="" id="question-${idx}" value="${data.question}" disabled></td>
							<td><input type="text" class="" id="optnA-${idx}" value="${data.optionA}" disabled></td>
							<td><input type="text" class="" id="optnB-${idx}" value="${data.optionB}" disabled></td>
							<td><input type="text" class="" id="optnC-${idx}" value="${data.optionC}" disabled></td>
							<td><input type="text" class="" id="optnD-${idx}" value="${data.optionD}" disabled></td>
							<td><input type="text" class="" id="answer-${idx}" value="${data.answer}" disabled></td>
							<td><button id="editBtn-${idx}" onClick="editBtnClickHandler()">EDIT</button></td>
							<td><button id="updateBtn-${idx}" disabled>UPDATE</button></td>
							</tr>`
						});
						$('#questionTable').append(tableData);
						console.log(res.questions[0].questions);

					}
					if(res.error){
						errorDisplay.innerHTML = res.error;
						return;
					}
				});
			})
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

		if(document.getElementById('homeBtnContainer')){
			document.getElementById('headerHomeBtn').style.display = 'none';
			document.getElementById('headerAddBtn').style.display = 'none';
			document.getElementById('headerEditBtn').style.display = 'none';
			return;
		}
	function editBtnClickHandler(e){
		let x = e.target.id;/*|| $(this).id*/;
		console.log(x);
	}

});


