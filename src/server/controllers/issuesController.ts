/// <reference path='../../../interfaces/async/async.d.ts'/>

import abstractController = require("./abstractController");
import labelsController = require("./labelsController");
import async = require("async");
import util = require("util");
import configuration = require('../config/configuration');

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
			(getLabelsCompleted: Function) => {
				labelsController.getLabels(this, user, repository, getLabelsCompleted);
			},
			(labels: any, getAllIssuesCompleted: Function) => { 
				self.getGitHubClient().issues.repoIssues({
					user: user,
					repo: repository,
					milestone: milestone
				}, (err: any, data: any[]) => { 
					getAllIssuesCompleted(err, labels, data); 
				}); 
			},
			(labels: any, allIssues: any[], assignIssuesCompleted: Function) => {
				var results = JSON.parse(JSON.stringify(labels.categories)); // Clone categories
				results = results.map((x: any) => { x.phases = null; return x; });

				for (var i = 0; i < allIssues.length; i++) {
					var issue = allIssues[i];
					var category = configuration.defaultCategoryName;
					var phase = configuration.phaseNames.backlog;

					for (var j = 0; j < issue.labels.length; j++) {
						var label = issue.labels[j];
						var match = configuration.categoryRegEx.exec(label.name);

						if (match !== null) {
							category = label.name;
							break;
						}
					}

					for (var j = 0; j < issue.labels.length; j++) {
						var label = issue.labels[j];
						var match = configuration.phaseRegEx.exec(label.name);

						if (match !== null) {
							phase = label.name;
							break;
						}
					}

					var categorizedIssues = results.filter((x: any) => { return x.name === category; })[0];

					if (categorizedIssues.phases === null) {
						categorizedIssues.phases = JSON.parse(JSON.stringify(labels.phases)); 
						categorizedIssues.phases.map((x: any) => { x.issues = []; return x });
					}

					var phasedIssue = categorizedIssues.phases.filter((x: any) => { return x.name === phase; })[0];
					phasedIssue.issues.push(issue);
				}

				assignIssuesCompleted(null, results);
			}
			], (err: any, result: any[]) => {
				if (err) {
					self.logger.error("Error occured during issues retrieval", err);	
				} else {
					
				}

				self.jsonResponse(err, result);
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