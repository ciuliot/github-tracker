/// <reference path='../../../interfaces/async/async.d.ts'/>

import async = require("async");
import util = require("util");

import abstractController = require("./abstractController");
import labelsController = require("./labelsController");
import configuration = require('../config/configuration');
import labelsModel = require("../models/labels_model");

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

		var requestBody = {
			user: user,
			state: "open",
			repo: repository,
			milestone: milestone
		};

		async.waterfall([
			(getLabelsCompleted: Function) => {
				labelsController.getLabels(this, user, repository, getLabelsCompleted);
			},
			(labels: labelsModel.IndexResult, getOpenIssuesCompleted: Function) => { 
				self.getGitHubClient().issues.repoIssues(requestBody, (err: any, data: any[]) => { 
					getOpenIssuesCompleted(err, labels, data); 
				}); 
			},
			(labels: labelsModel.IndexResult, allIssues: any[], assignOpenIssuesCompleted: Function) => {
				var results = JSON.parse(JSON.stringify(labels.categories)); // Clone categories
				results = results.map((x: any) => { x.phases = []; return x; });

				self.transformIssues(labels, allIssues, results);

				assignOpenIssuesCompleted(null, labels, results);
			},
			(labels: labelsModel.IndexResult, results: any[], getClosedIssuesCompleted: Function) => {
				requestBody.state = "closed";
				self.getGitHubClient().issues.repoIssues(requestBody, (err: any, data: any[]) => { 
					getClosedIssuesCompleted(err, labels, results, data); 
				});
			},
			(labels: labelsModel.IndexResult, results: any, allIssues: any[], assignClosedIssuesCompleted: Function) => {
				self.transformIssues(labels, allIssues, results, configuration.phaseNames.closed);
				assignClosedIssuesCompleted(null, results);
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

	transformIssues(labels: labelsModel.IndexResult, allIssues: any[], results: any, forcePhase: string = null) {
		for (var i = 0; i < allIssues.length; i++) {
			var issue = allIssues[i];
			var category = configuration.defaultCategoryName;
			var phase = forcePhase || configuration.phaseNames.backlog;

			for (var j = 0; j < issue.labels.length; j++) {
				var label = issue.labels[j];
				var match = configuration.categoryRegEx.exec(label.name);

				if (match !== null) {
					category = label.name;
					break;
				}
			}

			if (forcePhase === null) {
				for (var j = 0; j < issue.labels.length; j++) {
					var label = issue.labels[j];
					var match = configuration.phaseRegEx.exec(label.name);

					if (match !== null) {
						phase = label.name;
						break;
					}
				}
			}

			var categorizedIssues = results.filter((x: any) => { return x.id === category; })[0];

			if (categorizedIssues.phases.length === 0) {
				categorizedIssues.phases = JSON.parse(JSON.stringify(labels.phases)); 
				categorizedIssues.phases.map((x: any) => { x.issues = []; return x });
			}

			var phasedIssue = categorizedIssues.phases.filter((x: any) => { return x.id === phase; })[0];
			phasedIssue.issues.push( { 
				title: issue.title,
				number: issue.number,
				body: issue.body,
				assignee: issue.assignee ? { login: issue.assignee.login, avatar_url: issue.assignee.avatar_url } : null
			});
		}
	}
}

var instance: any = new IssuesController();
export = instance;