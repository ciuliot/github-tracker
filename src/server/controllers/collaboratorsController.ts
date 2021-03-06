/// <reference path='../../../interfaces/async/async.d.ts'/>

import abstractController = require("./abstractController");
import async = require("async");
import util = require("util");

import configuration = require('../config/configuration');

class CollaboratorsController extends abstractController {
	constructor() {
		super("collaborators");

		this.ensureLogin("*");
	}

	index() {
		var self = this;

		var user = self.param("user");
		var repository = self.param("repository");

		this.getCollaborators(this, user, repository, (err, result?) => {
			self.jsonResponse(err, result);
		});
	}

	getCollaborators(controller: abstractController, user:string, repository: string, 
					 callback: (err: any, result?: any) => void) {
		if (!user) {
			callback("Parameter 'user' was not provided");
		} else if (!repository) {
			callback("Parameter 'repository' was not provided");
		} else {
			controller.logInfo([user, repository], "Loading collaborators");

			async.waterfall([
				(getAllCollaboratorsCompleted: Function) => { 
					controller.getGitHubClient().repos.getCollaborators({
						user: user,
						repo: repository
					}, getAllCollaboratorsCompleted); 
				},
				(collaborators: any[], transformCollaboratorsCompleted: Function) => {
					var result = collaborators.map((x: any) => {
						return {
							id: x.id,
							login: x.login,
							avatar_url: x.avatar_url
						};
					});
				
					result.unshift({ id: null, login: null, avatar_url: null });
					transformCollaboratorsCompleted(null, result);
				}
				], (err: any, collaborators: any[]) => {
					callback(err, collaborators);
				}
			);
		}
	}
}

var instance: any = new CollaboratorsController();
export = instance;