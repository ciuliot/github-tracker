/// <reference path='../../../interfaces/async/async.d.ts'/>

import abstractController = require("./abstractController");
import async = require("async");
import util = require("util");

class MilestonesController extends abstractController {
	constructor() {
		super("milestones");

		this.ensureLogin("*");
	}

	index() {
		var self = this;

		var user = self.param("user");
		var repository = self.param("repository");

		if (!user) {
			self.jsonResponse("Parameter 'user' was not provided");
		} else if (!repository) {
			self.jsonResponse("Parameter 'repository' was not provided");
		} else {
			this.logger.info("Loading milestones for repository '%s/%s'", user, repository);

			async.waterfall([
				(getAllMilestones: Function) => { 
					self.getGitHubClient().issues.getAllMilestones({
						user: user,
						repo: repository
					}, getAllMilestones); 
				},
				(milestones: any[], convertMilestonesCompleted: Function) => {
					var result = milestones.map((x: any) => {
						return {
							number: x.number,
							state: x.state,
							title: x.title,
							open_issues: x.open_issues,
							closed_issues: x.closed_issues
						};
					});

					convertMilestonesCompleted(null, result);
				},
				], (err: any, milestones: any[]) => {
					self.jsonResponse(err, milestones);
				}
			);
		}
	}
}

var instance: any = new MilestonesController();
export = instance;