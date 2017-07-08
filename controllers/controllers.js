'use strict';

//import opened DB connection from server.js
const db = require('../server').db;

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
	if(!req.session.user){
		res.redirect('/');
		return;
	}
	//res.render();
}

exports.showAdd = (req, res) => {
	if(!req.session.user){
		res.redirect('/');
		return;
	}
	//res.render();
}