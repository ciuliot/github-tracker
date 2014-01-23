/// <reference path='../../../interfaces/async/async.d.ts'/>

import abstractController = require("./abstractController");
import async = require("async");
import util = require("util");

class IssuesController extends abstractController {
	constructor() {
		super("issues");

		this.ensureLogin("*");
	}

	index() {
		var self = this;

		var user = self.param("user");
		var repository = self.param("repository");

		this.logger.info("Loading labels for repository '%s/%s'", user, repository);

		async.waterfall([
			(getAllIssues: Function) => { 
				self.getGitHubClient().issues.getLabels({
					user: user,
					repo: repository
				}, getAllIssues); 
			}
			], (err: any, allLabels: any[]) => {
				self.logger.debug(allLabels);
				self.jsonResponse(err, allLabels);
			}
		);
	}
}

var instance: any = new IssuesController();
export = instance;