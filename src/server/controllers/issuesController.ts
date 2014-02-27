/// <reference path='../../../interfaces/async/async.d.ts'/>
/// <reference path='../../../interfaces/mustache/mustache.d.ts'/>

import async = require("async");
import util = require("util");
import fs = require("fs");
import path = require("path");

import abstractController = require("./abstractController");
import labelsController = require("./labelsController");
import labelsModel = require("../models/labels_model");
import clientModel = require("../models/client_model");
import socketio = require('socket.io');
import configuration = require("../config/configuration");

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
				self.logger.debug("Transforming %d closed issues", allIssues.length);
				self.transformIssues(user, repository, labels, allIssues, results, configuration.phaseNames.closed);
				assignClosedIssuesCompleted(null, results);
			}
		];

		this.getIssues(loadStep, additionalSteps);
	}

	/*show() {
		var self = this;
		var requestBody = {
			user: self.param("user"),
			repo: self.param("repository"),
			number: self.param("id")
		};

		var loadStep: Function = (labels: labelsModel.IndexResult, getIssueCompleted: Function) => { 
				self.logger.debug("Retrieving issue #%s", requestBody.number);
				self.getGitHubClient().issues.getRepoIssue(requestBody, (err: any, data: any) => { 
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
	}*/

	private getIssues(retrieveStep: Function, additionalLoadSteps: Function[] = [(labels: any, results:any, cb:Function) => { cb(null, results); } ], transformFunction: Function = null) {
		var self = this;

		var user = self.param("user");
		var repository = self.param("repository");
		var milestone = self.param("milestone");

		if (!user) {
			self.jsonResponse("Parameter 'user' was not provided");
		} else if (!repository) {
			self.jsonResponse("Parameter 'repository' was not provided");
		} else if (!milestone) {
			self.jsonResponse("Parameter 'milestone' was not provided");
		} else {
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
					var results: any[] = []; 
					self.logger.debug("Transforming %d open issues", allIssues.length);

					self.transformIssues(user, repository, labels, allIssues, results);

					assignOpenIssuesCompleted(null, labels, results);
				}
			];

			steps = steps.concat(additionalLoadSteps);

			steps.push(
				(result: any[], getIssueBranchesCompleted: Function) => {
					var issuesToRetrieve: any[] = [];
					self.logger.debug("Looking for issue branches");

					for (var i = 0; i < result.length; i++) {
						var issue: any = result[i];

						if (issue.phase.id !== configuration.phaseNames.backlog && issue.phase.id !== configuration.phaseNames.closed) {
							issuesToRetrieve = issuesToRetrieve.concat(issue);
						} else {
							issue.branch = self.convertBranchInfo();
						}
					}

					self.logger.debug("Found %d issues for branch retrieval", issuesToRetrieve.length);

					async.forEach(issuesToRetrieve, (issue: any, cb: Function) => {
						self.getIssueBranchInfo(issue.number, user, repository, (err: any, result: any) => {
							issue.branch = result;
							issue.compareUrl = self.getCompareUrl(user, repository, issue.phase.id, issue.branch);
							cb();
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
					/* istanbul ignore if */ 
					if (err) {
						self.logger.error("Error occured during issues retrieval", err);	
					}

					self.jsonResponse(err, {
						meta: {
							estimateSizes: configuration.estimateSizes,
							branchNameFormat: configuration.branchNameFormat,
							priorityTypes: configuration.priorityTypes
						},
						issues: result
					});
				}
			);
		}
	}

	private convertBranchInfo(data?: any): any {
		return data ? {
			ref: data.ref,
			name: data.ref.replace("refs/heads/", ""),
			url: data.url 
		} : { name: null, url: null };
	}

	private getIssueBranchInfo(number: number, user: string, repository: string, callback: Function) {
		var self = this;
		var branchName = util.format("heads/" + configuration.branchNameFormat, number);
		self.logger.info("Trying to get branch %s for issue %d", branchName, number);

		async.waterfall([
			(getBranchInfoCompleted: Function) => {
				self.getGitHubClient().gitdata.getReference({
					user: user,
					repo: repository,
					ref: branchName
				}, getBranchInfoCompleted);
			}/*,
			(branchInfo: any, getPullRequestCompleted: Function) => {
				getPullRequestCompleted(null, branchInfo);
			}*/
		], (err: any, result: any) => {
			if (err) {
				self.logger.debug("Branch %s not found", branchName);
				err = err.code === 404 ? null : err; // Branch not found
			} else {
				self.logger.debug("Branch %s found", branchName);
			}	

			callback(err, self.convertBranchInfo(result));	
		});
	}

	update(): void {
		var self = this;

		var number = self.param("id");
		var user = self.param("user");
		var repository = self.param("repository");

		var collaborator = self.param("collaborator");
		var phase = self.param("phase");
		var body = self.param("body");

		if (!user) {
			self.jsonResponse("Parameter 'user' was not provided");
		} else if (!repository) {
			self.jsonResponse("Parameter 'repository' was not provided");
		} else {

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
			} else if (phase !== undefined) {
				self.logger.info("Updating issue %s - updating phase to %s", number, phase);
				tasks = [];
				var branchInfo: any = undefined;

				if (phase === configuration.phaseNames.inprogress) {
					var branchName = util.format("heads/" + configuration.branchNameFormat, number);

					tasks.push((getBranchCompleted: Function) => {
						self.getIssueBranchInfo(number, user, repository, (err: any, result: any) => {
							if (!result) {
								self.logger.info("Issue branch doesn't exists, trying to create new branch %s for issue %d", branchName, number);
								async.waterfall([
									(getMasterBranchCompleted: Function) => {
										self.logger.info("Getting master branch for repo %s/%s", user, repository);
										self.getGitHubClient().gitdata.getReference({
											user: user,
											repo: repository,
											ref: "heads/master"
										}, (err: any, data: any) => {
											getMasterBranchCompleted(err, data);
										});	
									}, 
									(masterBranch: any, createBranchCompleted: Function) => {
										self.logger.info("Creating new branch %s for repo %s/%s", branchName, user, repository);
										self.getGitHubClient().gitdata.createReference({
											user: user,
											repo: repository,
											ref: "refs/" + branchName,
											sha: masterBranch.object.sha
										}, createBranchCompleted);
									}
									], (err: any, result: any) => { 
										getBranchCompleted(err, result); 
									});
							} else {
								getBranchCompleted(err, self.convertBranchInfo(result));
							}				
						});
					});

					tasks.push((result: any, storeBranchCompleted: Function) => {		
						branchInfo = result;
						storeBranchCompleted();
					});
				}

				tasks.push((getIssueCompleted: Function) => {
					self.getGitHubClient().issues.getRepoIssue(message, getIssueCompleted);
				});
				tasks.push((issue: any, updateIssueCompleted: Function) => {
					message.labels = issue.labels.map((x: any) => { return x.name });
					message.labels = message.labels.filter((x: string) => { return configuration.phaseRegEx.exec(x) === null; });

					if (phase !== configuration.phaseNames.closed) {
						message.labels.push(phase);
					} else {
						message.state = "closed";
					}

					self.getGitHubClient().issues.edit(message, (err: any, result: any) => {
						if (!err) {
							result.branch = branchInfo;
						}
						
						updateIssueCompleted(err, result);
					});
				});
			} 
			else if (body !== undefined) {
				self.logger.info("Updating issue %s - updating body to %o", number, body);

				tasks = [
					(renderTemplateCompleted: Function) => {
						self.getDescriptionFromBody(body, renderTemplateCompleted);
					},
					(output: string, getIssueCompleted: Function) => {
						self.getGitHubClient().issues.getRepoIssue(message, (err: any, data: any) => {
							getIssueCompleted(err, data, output);
						});
					},
					(issue: any, formattedBody: string, issueSaveCompleted: Function) => {
						message.labels = issue.labels.map((x: any) => { return x.name });
						message.labels = message.labels.filter((x: string) => { return configuration.phaseRegEx.exec(x) !== null; }); // Keep only phase labels

						message.labels = message.labels.concat(self.getLabelsFromBody(body));

						message.body = formattedBody;
						message.title = body.title;

						self.getGitHubClient().issues.edit(message, issueSaveCompleted);
					}
				];
			}

			if (tasks.length == 0) {
				self.jsonResponse("Operation not allowed");
			} else {
				tasks.push((issue: any, getLabelsCompleted: Function) => {
					labelsController.getLabels(self, user, repository, (err: any, labels: any) => {
						getLabelsCompleted(err, issue, labels);
					});
				});
				tasks.push((issue: any, labels: labelsModel.IndexResult, getBranchCompleted: Function) => {
					if (issue.branch) {
						getBranchCompleted(null, issue, labels);
					} else {
						self.getIssueBranchInfo(number, user, repository, (err: any, result: any) => {
							issue.branch = result;
							getBranchCompleted(null, issue, labels);
						});
					}
				});
				tasks.push((issue: any, labels: labelsModel.IndexResult, convertIssueCompleted: Function) => {
					convertIssueCompleted(null, self.convertIssue(user, repository, issue, labels));
				});
				tasks.push((issue: any, sendUpdatesToClientsCompleted: Function) => {
					self.logger.info("Sending update via sockets");
					var sio = configuration.socketIO.sockets.in(util.format("%s/%s", user, repository));
					sio.emit("issue-update", issue);

					sendUpdatesToClientsCompleted(null, issue);
				});

				async.waterfall(tasks, (err: any, result: any) => {
					if (err) {
						self.logger.error("Error occured during issue update", err);	
					} 
					self.jsonResponse(err, result);
				});
			}
		}
	}

	private getDescriptionFromBody(body: any, callback: Function) {
		var templateName: string = body.type ? body.type.id : undefined;
		templateName = templateName || "default";
		var self = this;
				
		if (!fs.existsSync(path.resolve(configuration.templatesDir(), templateName))) {
			templateName = "default";
		}

		async.waterfall([
			(loadTemplateCompleted: (err: ErrnoException, data: any) => void) => {
				self.logger.debug("Using template %s", templateName);
				fs.readFile(path.resolve(configuration.templatesDir(), templateName), { encoding: 'utf8' }, loadTemplateCompleted);
			},
			(data: string, renderTemplateCompleted: Function) => {
				renderTemplateCompleted(null, mustache.render(data, body));
			}
		], (err: any, result: any) => { 
			callback(err, result); 
		});
	}

	private getLabelsFromBody(body: any): string[] {
		var labels: string[] = [];
		var categoryId = body.category ? body.category.id : undefined;
		categoryId = categoryId || configuration.defaultCategoryName;

		if (categoryId !== configuration.defaultCategoryName) {
			labels.push(categoryId);
		}

		var typeId = body.type ? body.type.id : undefined;
		typeId = typeId || "";

		if (typeId.length > 0) {
			labels.push(typeId);
		}

		return labels;
	}

	create(): void {
		var self = this;

		var user = self.param("user");
		var repository = self.param("repository");
		var body = self.param("body");
		var title = self.param("title");

		if (!user) {
			self.jsonResponse("Parameter 'user' was not provided");
		} else if (!repository) {
			self.jsonResponse("Parameter 'repository' was not provided");
		} else if (!body) {
			self.jsonResponse("Parameter 'body' was not provided");
		} else if (!title) {
			self.jsonResponse("Parameter 'title' was not provided");
		} else {
			var message: any = {				
				user: user,
				repo: repository,
				milestone: self.param("milestone"),
				title: title
			};

			self.logger.info("Creating new issue at %s/%s/%s [%s]", user, repository, message.milestone, title);
			self.logger.info(body);

			var labels: labelsModel.IndexResult;

			async.waterfall([
				(getLabelsCompleted: Function) => {
					labelsController.getLabels(self, user, repository, getLabelsCompleted);
				},
				(result: labelsModel.IndexResult, renderTemplateCompleted: Function) => {
					labels = result;
					self.getDescriptionFromBody(body, renderTemplateCompleted);
				},
				(formattedBody: string, createIssueCompleted: Function) => {
					try {
						message.labels = self.getLabelsFromBody(body);
						message.body = formattedBody;

						self.getGitHubClient().issues.create(message, createIssueCompleted);
					}
					catch (ex) {
						/* istanbul ignore next */ 
						createIssueCompleted(ex);
					}
				},
				(issue: any, convertIssueCompleted: Function) => {
					try {
						convertIssueCompleted(null, self.convertIssue(user, repository, issue, labels));
					} catch (ex) {
						/* istanbul ignore next */ 
						convertIssueCompleted(ex);	
					}
				}
			], (err: any, result: any) => {
				/* istanbul ignore next */ 
				if (err) {
					self.logger.error("Error occured during issue create", err);	
				}

				self.jsonResponse(err, result);
			});
		}
	}

	transformIssues(user: string, repository: string, labels: labelsModel.IndexResult, allIssues: any[], results: any, forcePhase: string = null) {
		for (var i = 0; i < allIssues.length; i++) {
			results.push(this.convertIssue(user, repository, allIssues[i], labels, forcePhase)); 
		}
	}

	private getCompareUrl(user: string, repository: string, phase: string, branch: any) {
		return (phase === configuration.phaseNames.inprogress && branch != undefined && branch.name !== null) ? 
				util.format(configuration.pullRequestCompareFormat, user, repository, branch.name) : null;
	}

	private convertIssue(user: string, repository: string, issue: any, labels: labelsModel.IndexResult, forcePhase: string = null): any {
		var category = configuration.defaultCategoryName;
		var phase = forcePhase || (issue.state === "closed" ? configuration.phaseNames.closed :	configuration.phaseNames.backlog);
		var typeName: string = null; 
		var issueLabels = issue.labels || [];

		for (var j = 0; j < issueLabels.length; j++) {
			var label = issueLabels[j];
			var categoryMatch = configuration.categoryRegEx.exec(label.name);
			var phaseMatch = configuration.phaseRegEx.exec(label.name);

			if (categoryMatch !== null) {
				category = label.name;
			} else if (phaseMatch !== null) {
				if (forcePhase === null) {
					phase = label.name;
				}
			} else if (typeName === null) {
				typeName = label.name;
			}
		}

		var type = typeName === null ? null : labels.types.filter(x => x.id === typeName)[0];
		this.logger.info("Transforming issue #%d to '%s'/'%s' [%s]", issue.number, category, phase, type === null ? "" : type.id);

		var convertedIssue: any = {
			title: issue.title,
			category: labels.categories.filter(x => x.id === category)[0],
			phase: labels.phases.filter(x => x.id === phase)[0],
			type: type || { name: null, id: null, color: null },
			number: issue.number,
			compareUrl: this.getCompareUrl(user, repository, phase, issue.branch),
			description: issue.body || "",
			branch: issue.branch,
			assignee: issue.assignee ? { login: issue.assignee.login, avatar_url: issue.assignee.avatar_url } : { login: null, avatar_url: null }
		};

		var bodyParts = convertedIssue.description.split(configuration.bodyFieldsSeparator);

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

		return convertedIssue;

	}
}

var instance: any = new IssuesController();
export = instance;