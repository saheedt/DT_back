'use strict';

//import opened DB connection from server.js
import db from 'server';

export function showLogin(req, res){
	if (req.session.user){
		res.redirect('/home');
		return;
	}
	res.render('login', {
		title: 'Sign In'
	});
}

export function showHome(req, res){
	if(!req.session.user){
		res.redirect('/');
		return;
	}
	//res.render();
}

export function showAdd(req, res){
	if(!req.session.user){
		res.redirect('/');
		return;
	}
	//res.render();
}