/// <reference path='../../../interfaces/async/async.d.ts'/>

import abstractController = require("./abstractController");
import async = require("async");
import util = require("util");

import configuration = require('../config/configuration');

class UserController extends abstractController {
	constructor() {
		super("user");

		this.ensureLogin("*");
	}

	index() {
		var self = this;

		this.getUser(this, (err, result) => {
			self.jsonResponse(err, result);
		});
	}

	getUser(controller: abstractController, callback: (err: any, result: any) => void) {
		controller.logger.info("Loading user for data");

		async.waterfall([
			(getUserCompleted: Function) => { 
				controller.getGitHubClient().user.get({ }, getUserCompleted); 
			}
			], (err: any, user: any) => {
				if (!err) {
					user = {
						id: user.id,
						name: user.name,
						login: user.login,
						avatar_url: user.avatar_url
					};
				}
				controller.logger.debug(user);
				controller.jsonResponse(err, user);
			}
		);
	}
}

var instance: any = new UserController();
export = instance;