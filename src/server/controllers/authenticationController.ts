/// <reference path='../../../interfaces/locomotive/locomotive.d.ts'/>

import abstractController = require("./abstractController");

var passport = require('passport');
var connectEnsureLogin = require('connect-ensure-login');

class AuthenticationController extends abstractController {
	constructor() {
		super("authentication");
		this.before("login", connectEnsureLogin.ensureNotLoggedIn("/"));
		this.before("authenticate", passport.authenticate('github'));
		this.before("callback", passport.authenticate('github', { failureRedirect: '/login' }));
	}

	login() {
		this.render();
	}

	authenticate() {
		passport.authenticate('github');
	}

	callback() {
		this.redirect('/');
	}

	logout() {
		this.req["logout"]();
  		this.redirect('/');
	}
}

var instance: any = new AuthenticationController();
export = instance;