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

		this.logger.info("Loading milestones for repository '%s/%s'", user, repository);

		async.waterfall([
			(getAllMilestones: Function) => { 
				self.getGitHubClient().issues.getAllMilestones({
					user: user,
					repo: repository
				}, getAllMilestones); 
			}
			], (err: any, milestones: any[]) => {
				self.logger.debug(milestones);
				self.jsonResponse(err, milestones);
			}
		);
	}
}

var instance: any = new MilestonesController();
export = instance;