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
				user = {
					id: user.id,
					name: user.name,
					login: user.login,
					avatar_url: user.avatar_url
				};
				controller.logger.debug(user);
				controller.jsonResponse(err, user);
			}
		);
	}

	subscribeForNotifications() {
		var self = this;
		var requestBody = {
			user: self.param("user"),
			repo: self.param("repository")
		};

		async.waterfall([
			(getRepositoryCompleted: Function) => {
				self.getGitHubClient().repos.get(requestBody, getRepositoryCompleted);
			},
			(repository: any, subscribeToRoom: Function) => {

			}
		])
	}
}

var instance: any = new UserController();
export = instance;