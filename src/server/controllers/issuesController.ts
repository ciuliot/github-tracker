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
		var milestone = self.param("milestone");

		this.logger.info("Loading issues for repository '%s/%s' @ milestone '%s'", user, repository, milestone);

		async.waterfall([
			(getAllIssues: Function) => { 
				self.getGitHubClient().issues.repoIssues({
					user: user,
					repo: repository,
					milestone: milestone
				}, getAllIssues); 
			}
			], (err: any, allIssues: any[]) => {
				var issues = null;
				if (err) {
					self.logger.error("Error occured during issues retrieval", err);	
				} else {
					issues = self.transformIssues(allIssues);
				}

				self.jsonResponse(err, issues);
			}
		);
	}

	transformIssues(issues: any[]): any {
		var re = /\d\s*-\s*(.+)/;
		var result: any = {};

		for (var i = 0; i < issues.length; i++) {
			var issue = issues[i];
			var category = "unknown";
			var phase = "unknown";

			for (var j = 0; j < issue.labels.length; j++) {
				var label = issue.labels[j];
				var match = re.exec(label.name);

				if (label.name.indexOf("@") === 0) {
					category = label.name;
					break;
				} else if (match !== null) {
					phase = match[1];
				}
			}

			if (result[category] === undefined) {
				result[category] = {};
			}

			if (result[category][phase] === undefined) {
				result[category][phase] = [];
			}

			result[category][phase].push(issue);
		}

		return result;
	}
}

var instance: any = new IssuesController();
export = instance;