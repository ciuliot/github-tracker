/// <reference path='../../../interfaces/async/async.d.ts'/>
/// <reference path='../../../interfaces/mustache/mustache.d.ts'/>

import async = require("async");
import util = require("util");
import fs = require("fs");
import path = require("path");

import abstractController = require("./abstractController");
import labelsController = require("./labelsController");
import configuration = require('../config/configuration');
import labelsModel = require("../models/labels_model");

var mustache: MustacheStatic = require("mustache");

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

		var loadStep: Function = (labels: labelsModel.IndexResult, getOpenIssuesCompleted: Function) => { 
				self.logger.debug("Retrieving open issues");
				self.getGitHubClient().issues.repoIssues(requestBody, (err: any, data: any[]) => { 
					getOpenIssuesCompleted(err, labels, data); 
				}); 
			};

		var additionalSteps: Function[] = [
			(labels: labelsModel.IndexResult, results: any[], getClosedIssuesCompleted: Function) => {
				requestBody.state = "closed";
				self.logger.debug("Retrieving closed issues");
				self.getGitHubClient().issues.repoIssues(requestBody, (err: any, data: any[]) => { 
					getClosedIssuesCompleted(err, labels, results, data); 
				});
			},
			(labels: labelsModel.IndexResult, results: any, allIssues: any[], assignClosedIssuesCompleted: Function) => {
				self.logger.debug("Transforming closed issues");
				self.transformIssues(labels, allIssues, results, configuration.phaseNames.closed);
				assignClosedIssuesCompleted(null, results);
			}
		];

		this.getIssues(loadStep, additionalSteps);
	}

	show() {
		var self = this;
		var requestBody = {
			user: self.param("user"),
			repo: self.param("repository"),
			number: self.param("id")
		};

		var loadStep: Function = (labels: labelsModel.IndexResult, getIssueCompleted: Function) => { 
				self.logger.debug("Retrieving issue #%s", requestBody.number);
				self.getGitHubClient().issues.getRepoIssue(requestBody, (err: any, data: any) => { 
					self.logger.debug(data);
					getIssueCompleted(err, labels, [ data ]); 
				}); 
			};

		this.getIssues(loadStep, undefined, (result: any[], transformCompleted: Function) => { 
			var issue: any = null;
			for (var i=0; i < result.length; i++) {
				for (var j = 0; j < result[i].phases.length; j++) {
					if (result[i].phases[j].issues.length > 0) {
						issue = result[i].phases[j].issues[0];
						break;
					}
				}
			}
			transformCompleted(null, issue); 
		});
	}

	private getIssues(retrieveStep: Function, additionalLoadSteps: Function[] = [(labels: any, results:any, cb:Function) => { cb(null, results); } ], transformFunction: Function = null) {
		var self = this;

		var user = self.param("user");
		var repository = self.param("repository");
		var milestone = self.param("milestone");

		self.logger.info("Loading issues for repository '%s/%s' @ milestone '%s'", user, repository, milestone);

		var requestBody = {
			user: user,
			state: "open",
			repo: repository,
			milestone: milestone
		};

		var steps: Function[] = [
			(getLabelsCompleted: Function) => {
				labelsController.getLabels(self, user, repository, getLabelsCompleted);
			},
			retrieveStep,
			(labels: labelsModel.IndexResult, allIssues: any[], assignOpenIssuesCompleted: Function) => {
				var results = JSON.parse(JSON.stringify(labels.categories)); // Clone categories
				results = results.map((x: any) => { x.phases = []; return x; });
				self.logger.debug("Transforming %d issues", allIssues.length);

				self.transformIssues(labels, allIssues, results);

				assignOpenIssuesCompleted(null, labels, results);
			}
		];

		steps = steps.concat(additionalLoadSteps);

		steps.push(
			(result: any[], getIssueBranchesCompleted: Function) => {
				var issuesToRetrieve: any[] = [];
				self.logger.debug("Looking for issue branches");

				self.logger.debug(result);
				for (var i = 0; i < result.length; i++) {
					var category: any = result[i];

					self.logger.debug(category);

					for (var j = 0; j < category.phases.length; j++) {
						var phase = category.phases[j];

						if (phase.id === configuration.phaseNames.onhold || phase.id === configuration.phaseNames.inprogress) {
							issuesToRetrieve = issuesToRetrieve.concat(phase.issues);
						}
					}
				}

				self.logger.debug("Found %d issues for branch retrieval", issuesToRetrieve.length);

				async.forEach(issuesToRetrieve, (issue: any, cb: Function) => {		
					var branch = util.format("heads/" + configuration.branchNameFormat, issue.number);
					self.logger.debug("Looking for branch %s", branch);
					self.getGitHubClient().gitdata.getReference({
						user: user,
						repo: repository,
						ref: branch
					}, (err:any, data: any) => {
						if (err) {
							cb(err.code === 404 ? null : err); // Branch not found
						} else {
							issue.branch = self.convertBranchInfo(data);
							cb();
						}
					});

				}, (err: any) => { 
					getIssueBranchesCompleted(err, result); 
				});
		});

		if (transformFunction !== null) {
			steps.push(transformFunction);
		}

		async.waterfall(steps, 
			(err: any, result: any[]) => {
				if (err) {
					self.logger.error("Error occured during issues retrieval", err);	
				} 

				self.jsonResponse(err, result);
			}
		);
	}

	private convertBranchInfo(data: any): any {
		return {
			ref: data.ref,
			name: data.ref.replace("refs/heads/", ""),
			url: data.url 
		};
	}

	update() {
		var self = this;

		var number = self.param("id");
		var user = self.param("user");
		var repository = self.param("repository");

		var collaborator = self.param("collaborator");
		var phase = self.param("phase");
		var body = self.param("body");

		var message: any = {				
			user: user,
			repo: repository,
			number: number
		};

		var tasks: any[] = [];

		if (collaborator !== undefined) {
			self.logger.info("Updating issue %s - assigning collaborator %s", number, collaborator);
			message.assignee = collaborator;

			tasks.push((updateIssueCompleted: Function) => {
				self.getGitHubClient().issues.edit(message, updateIssueCompleted);
			});

			self.getGitHubClient().issues.edit(message, (err: any, result: any) => { self.jsonResponse(err, result); });
		} else if (phase !== undefined) {
			self.logger.info("Updating issue %s - updating phase to %s", number, phase);

			tasks = [
				(getIssueCompleted: Function) => {
					self.getGitHubClient().issues.getRepoIssue(message, getIssueCompleted);
				},
				(issue: any, updateIssueCompleted: Function) => {
					message.labels = issue.labels.map((x: any) => { return x.name });
					message.labels = message.labels.filter((x: string) => { return configuration.phaseRegEx.exec(x) === null; });

					if (phase !== configuration.phaseNames.closed) {
						message.labels.push(phase);
					} else {
						message.state = "closed";
					}

					self.getGitHubClient().issues.edit(message, (err: any) => {
						updateIssueCompleted(err, issue);
					});
				},
				
			];

			if (phase === configuration.phaseNames.inprogress) {
				tasks.push((issue: any, getMasterBranchCompleted: Function) => {
					self.getGitHubClient().gitdata.getReference({
						user: user,
						repo: repository,
						ref: "heads/master"
					}, (err: any, data: any) => {
						getMasterBranchCompleted(err, issue, data);
					});	
				});

				tasks.push((issue: any, masterBranch: any, createBranchCompleted: Function) => {
					self.getGitHubClient().gitdata.createReference({
						user: user,
						repo: repository,
						ref: util.format("refs/heads/" + configuration.branchNameFormat, issue.number),
						sha: masterBranch.object.sha
					}, createBranchCompleted);
				});
			}
		} 
		else if (body !== undefined) {
			self.logger.info("Updating issue %s - updating body to %o", number, body);

			var templateDir = path.resolve(configuration.startupDirectory, './dist/templates');

			tasks = [
				(templateExistsCompleted: (err: ErrnoException, data: any) => void) => {
					var type: string = body.type.name || "default";
					
					if (!fs.existsSync(path.resolve(templateDir, type))) {
						type = "default";
					}

					templateExistsCompleted(null, type);
				},
				(templateName: string, loadTemplateCompleted: (err: ErrnoException, data: any) => void) => {
					self.logger.debug("Using template %s", templateName);
					fs.readFile(path.resolve(templateDir, templateName), { encoding: 'utf8' }, loadTemplateCompleted);
				},
				(data: string, renderTemplateCompleted: Function) => {
					mustache["escapeHtml"] = (text: string) => { return text; } // Disable escaping, we really just want plaintext
					var output = mustache.render(data, body);
					renderTemplateCompleted(null, output);
				},
				(formattedBody: string, issueSaveCompleted: Function) => {
					message.body = formattedBody;
					self.getGitHubClient().issues.edit(message, issueSaveCompleted);
				}
			];

			mustache.render
		}

		if (tasks.length == 0) {
			self.jsonResponse("Operation not allowed");
		} else {
			async.waterfall(tasks, (err: any, result: any[]) => {
				if (err) {
					self.logger.error("Error occured during issue update", err);	
				} else {
					self.logger.debug(result);
				}

				self.jsonResponse(err);
			});
		}
	}

	transformIssues(labels: labelsModel.IndexResult, allIssues: any[], results: any, forcePhase: string = null) {
		for (var i = 0; i < allIssues.length; i++) {
			var issue = allIssues[i];
			var category = configuration.defaultCategoryName;
			var phase = forcePhase || configuration.phaseNames.backlog;
			var type: labelsModel.Label = null;

			for (var j = 0; j < issue.labels.length; j++) {
				var label = issue.labels[j];
				var categoryMatch = configuration.categoryRegEx.exec(label.name);
				var phaseMatch = configuration.phaseRegEx.exec(label.name);

				if (categoryMatch !== null) {
					category = label.name;
				} else if (phaseMatch !== null) {
					if (forcePhase === null) {
						phase = label.name;
					}
				} else if (type === null) {
					type = label;
				}
			}

			var categorizedIssues = results.filter((x: any) => { return x.id === category; })[0];

			if (categorizedIssues.phases.length === 0) {
				categorizedIssues.phases = JSON.parse(JSON.stringify(labels.phases)); 
				categorizedIssues.phases.map((x: any) => { x.issues = []; return x; });
			}

			var convertedIssue: any = {
				title: issue.title,
				type: type || { name: null, id: null },
				number: issue.number,
				description: issue.body,
				branch: { name: null, url: null },
				assignee: issue.assignee ? { login: issue.assignee.login, avatar_url: issue.assignee.avatar_url } : { login: null, avatar_url: null },
				estimate: null
			};

			var bodyParts = convertedIssue.description.split(configuration.bodyFieldsSeparator);
			this.logger.debug(bodyParts);

			if (bodyParts.length === 2) {
				convertedIssue.description = bodyParts[1].trim();
				var input = bodyParts[0] + configuration.bodyFieldsSeparator;
				var fields: any = null;
				while ( (fields = configuration.bodyFieldsRegEx.exec(input)) !== null) {
					var name = fields[1].trim().toLowerCase();
					name = name.split(" ").map((val: string, index: number) => { return index === 0 ? val : (val[0].toUpperCase() + val.substring(1)); }).join("");

					convertedIssue[name] = fields[2].trim();
				}
			}

			var phasedIssue = categorizedIssues.phases.filter((x: any) => { return x.id === phase; })[0];
			phasedIssue.issues.push(convertedIssue); 
		}
	}
}

var instance: any = new IssuesController();
export = instance;