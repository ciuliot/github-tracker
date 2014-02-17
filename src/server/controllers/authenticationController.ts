/// <reference path='../../../interfaces/locomotive/locomotive.d.ts'/>

import abstractController = require("./abstractController");

var passport = require('passport');
var connectEnsureLogin = require('connect-ensure-login');

import configuration = require('../config/configuration');

class AuthenticationController extends abstractController {
	constructor() {
		super("authentication");
		this.before("login", connectEnsureLogin.ensureNotLoggedIn("/"));
		this.before("authenticate", passport.authenticate(configuration.loginStrategy));
		this.before("callback", passport.authenticate(configuration.loginStrategy, { failureRedirect: '/login' }));
	}

	login() {
		this.render();
	}

	authenticate() {
		passport.authenticate(configuration.loginStrategy);

		/* istanbul ignore else */ 
		if (configuration.loginStrategy === "basic") {
			this.jsonResponse(null, null);
		}
	}

	/* istanbul ignore next */ 
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