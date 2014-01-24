/// <reference path='../../../interfaces/async/async.d.ts'/>

import abstractController = require("./abstractController");
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
			(getLabels: Function) => {
				self.getGitHubClient().issues.getLabels({
					user: user,
					repo: repository
				}, getLabels); 
			},
			(allLabels: any[], getAllIssues: Function) => { 
				self.getGitHubClient().issues.repoIssues({
					user: user,
					repo: repository,
					milestone: milestone
				}, (err: any, data: any[]) => { 
					getAllIssues(err, allLabels, data); 
				}); 
			},
			(allLabels: any[], allIssues: any[], processIssues: Function) => {
				var result: any = null;
				var categories = allLabels.filter((x: any) => { return x.name.indexOf("@") === 0 });
				var phases = allLabels.filter((x: any) => {
					return configuration.phaseRegEx.exec(x.name) !== null;
				});

				result = categories.map((x: any) => { return { color: x.color, name: x.name } });
				result = result || [];
				result.push({ name: configuration.defaultCategoryName });

				for (var i = 0; i < result.length; i++) {
					var category = result[i];
					category.phases = phases.map((x: any) => { return { color: x.color, name: x.name }; });
					category.phases = category.phases || [];
					category.phases.unshift({ name: configuration.backlogPhaseName });
				}

				processIssues(null, result);
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