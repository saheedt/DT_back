window.addEventListener('load', ()=> {

	if(document.getElementById('tokInput')){
		localStorage.setItem('DT_BACK_TOK', document.getElementById('tokInput').value)
		document.getElementById('homeContainer').removeChild(document.getElementById('tokInput'));
	}

	if(!localStorage.getItem('DT_BACK_TOK') && !document.getElementById('loginTitle')){
		window.location.replace('/');
	}
	if(document.getElementById('logOUT')){
		document.getElementById('logOUT').addEventListener('click', (e)=>{
			e.preventDefault();
			localStorage.removeItem('DT_BACK_TOK');
			window.location.replace('/');
		});
	}

	if(document.getElementById('homeContainer')){
		document.getElementById('headerHomeBtn').style.display = 'none';
		document.getElementById('headerAddBtn').style.display = 'none';
		document.getElementById('headerEditBtn').style.display = 'none';
		
	}

	if(document.getElementById('editContainer')){
		document.getElementById('headerEditBtn').style.display = 'none';
		
	}


	let newCategory = document.getElementById('newCat'),
		categorySelect = document.getElementById('categorySelect'),
		levelSelect = document.getElementById('levelSelect'),
		newLevel = document.getElementById('newLev'),
		question = document.getElementById('newQuestn'),
		optionA = document.getElementById('optnA'),
		optionB = document.getElementById('optnB'),
		optionC = document.getElementById('optnC'),
		optionD = document.getElementById('optnD'),
		answer = document.getElementById('answer'),
		pullQuestions = document.getElementById('pullQuestionsBtn'),
		newCategoryBtn = document.getElementById('newCatBtn'),
		newLevelBtn = document.getElementById('newLevBtn'),
		submitQuestionBtn = document.getElementById('questnSubmitBtn'),
		loginForm = document.getElementById('loginform'),
		loginEmail = document.getElementById('loginEmail'),
		loginPassword = document.getElementById('loginPassword'),
		errorDisplay = document.getElementById('errorContainer');


	const getCategory = () =>{
		let categories = '';

		fetch("/api/category", {
  		method: "POST",
  		headers:{'Content-Type':'application/json',
  				'x-is-admin': '1'
  		},
  		body: JSON.stringify({token: localStorage.getItem('DT_BACK_TOK')})
		}).then((resp)=>{
			resp.json().then((res) =>{
				console.log(res)
				if(res.categories){
					if(res.categories.length <= 0){
						categorySelect.disabled = true;
						$(categorySelect).empty();
						$(categorySelect).append("<option value=''> --Select Category-- </option>");
						categorySelect.disabled = false;
						return;
					}
					categorySelect.disabled = true;
					$.each(res.categories, (idx, data)=>{
						categories += `<option value=${data.categoryname} > ${data.categoryname} </option>`;
					})
					$(categorySelect).append(categories);
					categorySelect.disabled = false;
					return;
				}
				if(res.error){
					//TODO: Handle error
					if((res.error.name == "TokenExpiredError") || (res.error.name && res.error.message)){
						window.location.replace('/');
						return
					}
					errorDisplay.innerHTML = res.error;
				}
				
				
			})
		});
		
	};

	//**********Add and edit page************
	
	//fetch level on category select change..
	if(categorySelect){

		getCategory();

	categorySelect.addEventListener('change', (e)=>{

		if(categorySelect.value == '' || categorySelect.value == ' '){
			errorDisplay.innerHTML = 'select valid category';
			return;
		}

		let category = {"category": categorySelect.value, token: localStorage.getItem('DT_BACK_TOK') }, levels = '';
		errorDisplay.innerHTML = '';

		fetch("api/level", {
  		method: "POST",
  		headers:{'Content-Type':'application/json',
  				 'x-is-admin': '1'
  		},
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
					if((res.error.name == "TokenExpiredError") || (res.error.name && res.error.message)){
						window.location.replace('/');
						return
					}
					errorDisplay.innerHTML = res.error;
				}
			})
		});
	});
	}

	if(newCategoryBtn){
		document.getElementById('headerAddBtn').style.display = 'none';

		newCategoryBtn.addEventListener('click', (e)=>{

		if(newCategory.value == '' || newCategory.value == ' '){
			errorDisplay.innerHTML = 'come on, do better with the category name!';
			return;
		}

		let catData = {
			"newCategory" : newCategory.value,
			token: localStorage.getItem('DT_BACK_TOK')
		}, categories = '';

		errorDisplay.innerHTML = '';

		fetch("/api/createcategory", {
  		method: "POST",
  		headers:{'Content-Type':'application/json',
  				 'x-is-admin': '1'
  		},
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
					if((res.error.name == "TokenExpiredError") || (res.error.name && res.error.message)){
						window.location.replace('/');
						return
					}
					errorDisplay.innerHTML = res.error;
				}
				
			})
		});
	});
	}

	//Add new category on category add button click.

	if(newLevelBtn){
	newLevelBtn.addEventListener('click', (e)=> {
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
			"newlevel": newLevel.value,
			token: localStorage.getItem('DT_BACK_TOK')
		}, levels = '';

		errorDisplay.innerHTML = '';

		fetch("api/createlevel", {
  			method: "POST",
  			headers:{'Content-Type':'application/json',
  					 'x-is-admin': '1'
  			},
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
					if((res.error.name == "TokenExpiredError") || (res.error.name && res.error.message)){
						window.location.replace('/');
						return
					}
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
					answer: answer.value,
					token: localStorage.getItem('DT_BACK_TOK')
				};
				errorDisplay.innerHTML = '';

				fetch("/api/createquestion", {
					method: "POST",
  					headers:{'Content-Type':'application/json',
  							 'x-is-admin': '1'
  					},
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
							if((res.error.name == "TokenExpiredError") || (res.error.name && res.error.message)){
								window.location.replace('/');
							return
							}
							errorDisplay.innerHTML = res.error;
							return;
						}
						
					});
				});
			})
	}





	//***********login page*********

	if(loginForm){
		loginForm.addEventListener('submit', (e) => {
			e.preventDefault();
			let logindata = {
				"email": loginEmail.value,
				"password": loginPassword.value,
				"isAdmin": true
			};

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

			const input3 = document.createElement('input');
			  	input3.type = 'hidden';
			  	input3.name = "isAdmin";
			  	input3.value = logindata.isAdmin;

			form.appendChild(input);
			form.appendChild(input2);
			form.appendChild(input3);
			document.body.appendChild(form);
			form.submit();
			document.body.removeChild(form);
			return false;
		});
	}


	if(pullQuestions){
		
		pullQuestions.addEventListener('click', (e)=>{
			let questionObj, tableData = `<tr>
											<th>Question</th>
											<th>Option A</th>
											<th>Option B</th>
											<th>Option C</th>
											<th>Option D</th>
											<th>Answer</th>
											<th>   </th>
											<th>   </th> 
										</tr>`;
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
				level: levelSelect.value,
				token: localStorage.getItem('DT_BACK_TOK')
			};

			fetch("api/question", {
				method: "POST",
				headers:{'Content-Type':'application/json',
						 'x-is-admin': '1'
				},
				body: JSON.stringify(questionObj)
			}).then((resp)=>{
				resp.json().then((res)=>{

					if(res.questions){
						res.questions[0].questions.map((data, idx) =>{
							return tableData += `<tr>
							<td><input type="text" class="" id="question-${idx}" value="${data.question}" disabled></td>
							<td><input type="text" class="" id="optnA-${idx}" value="${data.optionA}" disabled></td>
							<td><input type="text" class="" id="optnB-${idx}" value="${data.optionB}" disabled></td>
							<td><input type="text" class="" id="optnC-${idx}" value="${data.optionC}" disabled></td>
							<td><input type="text" class="" id="optnD-${idx}" value="${data.optionD}" disabled></td>
							<td><input type="text" class="" id="answer-${idx}" value="${data.answer}" disabled></td>
							<td style="display: none"><input type="text" class="" id="questionID-${idx}" value="${data.questionId}" disabled></td>
							<td><button id="editBtn-${idx}" class="editbtn">EDIT</button></td>
							<td><button id="updateBtn-${idx}" class="updatebtn" disabled>UPDATE</button></td>
							</tr>`;
						});
						$('#questionTable').empty();
						$('#questionTable').append(tableData);

    					setTimeout(()=>{
							const editButtons = document.querySelectorAll('.editbtn');
							const updateButtons = document.querySelectorAll('.updatebtn');

							Array.prototype.forEach.call(editButtons, (button) =>{
								button.addEventListener('click', (e)=>{

    								let obj ={
    									question: 'question', 
    									answer:'answer',
    									optnA: 'optnA',
    									optnB: 'optnB',
    									optnC: 'optnC',
    									optnD: 'optnD',
    									updateBtn: 'updateBtn'
    								};
    								let suffix = e.target.id.split("-")[1];
    								e.target.disabled = true;
    								document.getElementById(obj.question+'-'+suffix).disabled = false;
    								document.getElementById(obj.answer+'-'+suffix).disabled = false;
    								document.getElementById(obj.optnA+'-'+suffix).disabled = false;
    								document.getElementById(obj.optnB+'-'+suffix).disabled = false;
    								document.getElementById(obj.optnC+'-'+suffix).disabled = false;
    								document.getElementById(obj.optnD+'-'+suffix).disabled = false;
    								document.getElementById(obj.updateBtn+'-'+suffix).disabled = false;
    							});
    						});

    						//TODO: Compete update call and edit table to fit UI
    						Array.prototype.forEach.call(updateButtons, (button) =>{
    							button.addEventListener('click', (e)=>{
    								let obj ={
    									question: 'question', 
    									answer:'answer',
    									optnA: 'optnA',
    									optnB: 'optnB',
    									optnC: 'optnC',
    									optnD: 'optnD',
    									updateBtn: 'updateBtn',
    									editBtn: 'editBtn',
    									questionID: 'questionID'
    								};
    								let suffix = e.target.id.split("-")[1];
    								let updQstnObj = {
    									category: categorySelect.value,
    									level: levelSelect.value,
    									question: document.getElementById(obj.question+'-'+suffix).value,
    									optionA: document.getElementById(obj.optnA+'-'+suffix).value,
    									optionB: document.getElementById(obj.optnB+'-'+suffix).value,
    									optionC: document.getElementById(obj.optnC+'-'+suffix).value,
    									optionD: document.getElementById(obj.optnD+'-'+suffix).value,
    									answer: document.getElementById(obj.answer+'-'+suffix).value,
    									questionId: document.getElementById(obj.questionID+'-'+suffix).value,
    									token: localStorage.getItem('DT_BACK_TOK')
    								};
    								
    								fetch('/api/updatequestion',{
    									method: "POST",
    									headers:{'Content-Type':'application/json',
    											'x-is-admin': '1'
    									},
    									body: JSON.stringify(updQstnObj)
    								}).then((resp)=>{
    									resp.json().then((res)=>{
    										if(res.updatequestion){
    											e.target.disabled = true;
    											document.getElementById(obj.question+'-'+suffix).disabled = true;
    											document.getElementById(obj.answer+'-'+suffix).disabled = true;
    											document.getElementById(obj.optnA+'-'+suffix).disabled = true;
    											document.getElementById(obj.optnB+'-'+suffix).disabled = true;
    											document.getElementById(obj.optnC+'-'+suffix).disabled = true;
    											document.getElementById(obj.optnD+'-'+suffix).disabled = true;
    											document.getElementById(obj.editBtn+'-'+suffix).disabled = false;
    											return;
    										}
    										errorDisplay.innerHTML = res.error;
    									})
    								});

    							});
    						});
    					},0);
					}
					if(res.error){
						if((res.error.name == "TokenExpiredError") || (res.error.name && res.error.message)){
							window.location.replace('/');
							return
						}
						errorDisplay.innerHTML = res.error;
						return;
					}
					
				})
			})
		})
	}


});
