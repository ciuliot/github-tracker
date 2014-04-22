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

		this.getIssues();
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

	private getIssues() {
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
			self.logInfo([user, repository, milestone], "Loading issues");

			var requestBody = {
				user: user,
				state: "open",
				repo: repository,
				milestone: milestone
			};

			var labels: labelsModel.IndexResult;
			var allIssues: any[];

			var steps: Function[] = [
				(getLabelsCompleted: Function) => {
					labelsController.getLabels(self, user, repository, getLabelsCompleted);
				},
				(result: labelsModel.IndexResult, getOpenIssuesCompleted: Function) => { 
					labels = result;
					self.logInfo([user, repository, milestone], "Retrieving open issues");
					self.getGitHubClient().issues.repoIssues(requestBody, getOpenIssuesCompleted); 
				},
				(result: any[], getOpenIssuesCompleted: Function) => { 
					allIssues = result || [];
					requestBody.state = "closed";
					self.logInfo([user, repository, milestone], "Retrieving closed issues");

					self.getGitHubClient().issues.repoIssues(requestBody, getOpenIssuesCompleted); 
				},
				(result: any[], getIssueBranchesCompleted: Function) => { 
					try {
						allIssues = allIssues.concat(result);
					
						var issuesToRetrieve: any[] = [];
						self.logInfo([user, repository, milestone], "Looking for issues branches");

						for (var i = 0; i < allIssues.length; i++) {
							var issue: any = allIssues[i];
							var phase = self.getIssuePhase(issue, labels);

							if (phase.id !== configuration.phaseNames.closed) {
								issuesToRetrieve = issuesToRetrieve.concat(issue);
							} else {
								issue.branch = self.convertBranchInfo();
							}
						}

						self.logInfo([user, repository, milestone], "Found %d issues for branch retrieval", issuesToRetrieve.length);

						async.forEach(issuesToRetrieve, (issue: any, cb: Function) => {
							var phase = self.getIssuePhase(issue, labels);
							self.getIssueBranchInfo(issue.number, user, repository, (err: any, result: any) => {
								try {
									issue.branch = result;
									cb();
								}
								catch (ex) {
									self.logError([user, repository, milestone, issue.number], "Error occured during branch transformation", ex);
									cb(ex);
								}
							});
						}, (err: any) => { 
							getIssueBranchesCompleted(err); 
						});
					} catch (ex) {
						self.logError([user, repository, milestone], "Error occured during branch transformation", ex);
						getIssueBranchesCompleted(ex);
					}
				},
				(getIssuePullRequestsCompleted: Function) => {
					try {
						var issuesToRetrieve: any[] = [];
						self.logInfo([user, repository, milestone], "Looking for issues pull requests");

						for (var i = 0; i < allIssues.length; i++) {
							var issue: any = allIssues[i];
							var phase = self.getIssuePhase(issue, labels);

							if (phase.id !== configuration.phaseNames.backlog && 
								phase.id !== configuration.phaseNames.closed &&
								issue.pull_request &&
								issue.pull_request.html_url) {
								issuesToRetrieve = issuesToRetrieve.concat(issue);
							} else {
								issue.pull_request = self.convertPullRequestInfo();
							}
						}

						self.logInfo([user, repository, milestone], "Found %d issues for pull request retrieval", issuesToRetrieve.length);

						async.forEach(issuesToRetrieve, (issue: any, cb: Function) => {
							self.logDebug([user, repository, milestone, issue.number], "Getting pull request");
							self.getGitHubClient().pullRequests.get({
								user: user,
								repo: repository,
								number: issue.number
							}, (err: any, result: any) => {
								try {
									issue.pull_request = self.convertPullRequestInfo(result);
									cb();
								} catch (ex) {
									self.logError([user, repository, milestone, issue.number], "Error occured during pull request transformation", ex);
									cb(ex);
								}
							});
						}, (err: any) => { 
							getIssuePullRequestsCompleted(err); 
						});
					} catch (ex) {
						self.logError([user, repository, milestone], "Error occured during pull request transformation", ex);
						getIssuePullRequestsCompleted(ex);
					}
				},
				(assignOpenIssuesCompleted: Function) => {
					try {
						var results: any[] = []; 
						self.logInfo([user, repository, milestone], "Transforming %d issues", allIssues.length);

						assignOpenIssuesCompleted(null, self.transformIssues(user, repository, labels, allIssues));
					} catch (ex) {
						self.logError([user, repository, milestone], "Error occured during issues transformation", ex);
						assignOpenIssuesCompleted(ex);
					}
				}
			];

			async.waterfall(steps, 
				(err: any, result: any[]) => {
					/* istanbul ignore if */ 
					if (err) {
						self.logError([user, repository, milestone], "Error occured during issues retrieval", err);
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

	private convertPullRequestInfo(data?: any): any {
		return (data && data.html_url) ? {
			html_url: data.html_url,
			state: data.state
		} : { html_url: null, state: null };
	}

	private getIssueBranchInfo(id: string, user: string, repository: string, callback: Function) {
		var self = this;
		var branchName: string = util.format("heads/" + configuration.branchNameFormat, id);
		self.logInfo([user, repository, id], "Trying to get branch %s", branchName);

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
				self.logDebug([user, repository, id], "Branch %s not found", branchName);
				err = err.code === 404 ? null : err; // Branch not found
			} else {
				self.logDebug([user, repository, id], "Branch %s found", branchName);
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
				self.logInfo([user, repository, number], "Assigning collaborator '%s'", collaborator);
				message.assignee = collaborator;

				tasks.push((updateIssueCompleted: Function) => {
					self.getGitHubClient().issues.edit(message, updateIssueCompleted);
				});
			} else if (phase !== undefined) {
				self.logInfo([user, repository, number], "Updating phase to '%s'", phase);
				tasks = [];
				var branchInfo: any = undefined;

				if (phase === configuration.phaseNames.inprogress) {
					var branchName = util.format("heads/" + configuration.branchNameFormat, number);

					tasks.push((getBranchCompleted: Function) => {
						self.getIssueBranchInfo(number, user, repository, (err: any, result: any) => {
							if (result.name === null) {
								self.logInfo([user, repository, number], "Issue branch doesn't exists, trying to create new branch '%s'", branchName);

								async.waterfall([
									(getMasterBranchCompleted: Function) => {
										self.logInfo([user, repository, number], "Getting master branch");
										self.getGitHubClient().gitdata.getReference({
											user: user,
											repo: repository,
											ref: "heads/master"
										}, (err: any, data: any) => {
											getMasterBranchCompleted(err, data);
										});	
									}, 
									(masterBranch: any, createBranchCompleted: Function) => {
										self.logInfo([user, repository, number], "Creating new branch '%s'", branchName);
										self.getGitHubClient().gitdata.createReference({
											user: user,
											repo: repository,
											ref: "refs/" + branchName,
											sha: masterBranch.object.sha
										}, createBranchCompleted);
									}
									], (err:any, result: any) => {
										getBranchCompleted(err, result);
									});
							} else {
								getBranchCompleted(err, result);
							}				
						});
					});

					tasks.push((result: any, storeBranchCompleted: Function) => {		
						branchInfo = self.convertBranchInfo(result);
						storeBranchCompleted();
					});
				}

				if (phase === configuration.phaseNames.inreview) {
					tasks.push((createPullRequestCompleted: Function) => {
						var branchName = util.format(configuration.branchNameFormat, number);
						self.logInfo([user, repository, number], "Creating pull request for branch '%s'", branchName);
						self.getGitHubClient().pullRequests.createFromIssue({
							user: user,
							repo: repository,
							issue: number,
							base: "master",
							head : branchName
						}, (err: any) => {
							createPullRequestCompleted(err);
						});
					});
				}

				if (phase === configuration.phaseNames.closed) {
					tasks.push((mergePullRequestCompleted: Function) => {
						self.logInfo([user, repository, number], "Merging pull request", branchName);
						self.getGitHubClient().pullRequests.merge({
							user: user,
							repo: repository,
							number: number
						}, (err: any) => {
							mergePullRequestCompleted(err);
						});
					});
				}

				tasks.push((getIssueCompleted: Function) => {
					self.getGitHubClient().issues.getRepoIssue(message, getIssueCompleted);
				});
				tasks.push((issue: any, updateIssueCompleted: Function) => {
					message.labels = issue.labels.map((x: any) => { return x.name });
					message.labels = message.labels.filter((x: string) => { return configuration.phaseRegEx.exec(x) === null; });
					message.state = issue.state;
					message.state = "open";

					if (phase === configuration.phaseNames.onhold || phase === configuration.phaseNames.implemented) { // Only onhold & implemented phases have a label 
						message.labels.push(phase);
					} 
					if (phase === configuration.phaseNames.closed) {
						message.state = "closed";
					}

					self.logDebug([user, repository, number], "Branch info", branchInfo);

					self.logInfo([user, repository, number], "Updating issue state to %s and labels to %s", message.state, message.labels);

					self.getGitHubClient().issues.edit(message, (err: any, result: any) => {
						if (!err) {
							result.branch = branchInfo;
						}
						
						updateIssueCompleted(err, result);
					});
				});
			} 
			else if (body !== undefined) {
				self.logInfo([user, repository, number], "Updating body");

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
						try {
							message.labels = issue.labels.map((x: any) => { return x.name });
							message.labels = message.labels.filter((x: string) => { return configuration.phaseRegEx.exec(x) !== null; }); // Keep only phase labels

							message.labels = message.labels.concat(self.getLabelsFromBody(body));

							message.body = formattedBody;
							message.title = body.title;
							message.milestone = body.milestone;

							self.getGitHubClient().issues.edit(message, issueSaveCompleted);
						} catch (ex) {
							self.logError([user, repository, number], "Error occured during body update", ex);
							issueSaveCompleted(ex);
						}
					}
				];
			}

			if (tasks.length == 0) {
				self.jsonResponse("Operation not allowed");
			} else {
				var issue: any, labels: labelsModel.IndexResult;
				tasks.push((result: any, getLabelsCompleted: Function) => {
					issue = result;
					labelsController.getLabels(self, user, repository, getLabelsCompleted);
				});
				tasks.push((result: labelsModel.IndexResult, getBranchCompleted: Function) => {
					labels = result;
					if (issue.branch) {
						getBranchCompleted(null, issue.branch);
					} else {
						self.getIssueBranchInfo(number, user, repository, getBranchCompleted);
					}
				});
				tasks.push((result: any, getPullRequestCompleted: Function) => {
					issue.branch = result;
					self.getGitHubClient().pullRequests.get({ user: user, repo: repository, number: number }, (err: any, result: any) => {
						if (err && err.code === 404) { // In case that PR doesn't exist continue with empty
							getPullRequestCompleted(null, self.convertPullRequestInfo(null));
						} else {
							getPullRequestCompleted(err, result);
						}
					});
				});
				tasks.push((result: any, convertIssueCompleted: Function) => {
					issue.pull_request = result;
					try {
						issue = self.convertIssue(user, repository, issue, labels);
						self.logInfo([user, repository, number], "Sending update via websockets");

						var sio = configuration.socketIO.sockets.in(util.format("%s/%s", user, repository));
						sio.emit("issue-update", issue);

						convertIssueCompleted(null, issue);
					} catch (ex){
						self.logError([user, repository, number], "Error occured during issue conversion", ex);	
					}
				});

				async.waterfall(tasks, (err: any, result: any) => {
					/* istanbul ignore next */ 
					if (err) {
						self.logError([user, repository, number], "Error occured during issue update", err);
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
				
		/* istanbul ignore next */ 
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
				milestone: body.milestone,
				title: title
			};

			self.logInfo([user, repository, message.milestone], "Creating new issue with title '%s'", title);

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
						self.logError([user, repository, message.milestone], "Error occured during labels parsing", ex);
						createIssueCompleted(ex);
					}
				},
				(issue: any, convertIssueCompleted: Function) => {
					try {
						issue.pull_request = self.convertPullRequestInfo(issue.pull_request);
						convertIssueCompleted(null, self.convertIssue(user, repository, issue, labels));
					} catch (ex) {
						/* istanbul ignore next */ 
						self.logError([user, repository, message.milestone], "Error occured during issue conversion", ex);
						convertIssueCompleted(ex);	
					}
				}
			], (err: any, result: any) => {
				/* istanbul ignore next */ 
				if (err) {
					self.logError([user, repository, message.milestone], "Error occured during issue creation", err);
				}

				self.jsonResponse(err, result);
			});
		}
	}

	transformIssues(user: string, repository: string, labels: labelsModel.IndexResult, allIssues: any[], forcePhase: string = null): any[] {
		var results: any[] = [];
		for (var i = 0; i < allIssues.length; i++) {
			results.push(this.convertIssue(user, repository, allIssues[i], labels, forcePhase)); 
		}

		return results;
	}

	private getCompareUrl(user: string, repository: string, phase: string, branch: any) {
		return (branch != undefined && branch.name !== null) ? 
				util.format(configuration.pullRequestCompareFormat, user, repository, branch.name) : null;
	}

	private getIssuePhase(issue: any, labels: labelsModel.IndexResult): any {
		var phase: string = null;
		var issueLabels = issue.labels || [];

		for (var j = 0; j < issueLabels.length; j++) {
			var label = issueLabels[j];
			var phaseMatch = configuration.phaseRegEx.exec(label.name);

			if (phaseMatch !== null) {
				phase = label.name;
			}
		}

		// Closed state always takes precedence
		if (issue.state === "closed") {
			phase = configuration.phaseNames.closed;
		}

		if (phase === null) {
			phase = configuration.phaseNames.backlog;
			var pull_request = (issue.pull_request && issue.pull_request.html_url !== null) ? issue.pull_request : null;

			if (pull_request !== null && pull_request.state === "open") {
				phase = configuration.phaseNames.inreview;
			} else if (issue.branch && issue.branch.name !== null) {
				phase = configuration.phaseNames.inprogress;
			}
		}

		return labels.phases.filter(x => x.id === phase)[0];
	}

	private convertIssue(user: string, repository: string, issue: any, labels: labelsModel.IndexResult, forcePhase: string = null): any {
		var category = configuration.defaultCategoryName;
		var phase = this.getIssuePhase(issue, labels);
		var typeName: string = null; 
		var issueLabels = issue.labels || [];

		for (var j = 0; j < issueLabels.length; j++) {
			var label = issueLabels[j];
			var categoryMatch = configuration.categoryRegEx.exec(label.name);
			var phaseMatch = configuration.phaseRegEx.exec(label.name);

			if (categoryMatch !== null) {
				category = label.name;
			} else if (phaseMatch !== null) {
				// We already have phase
			} else if (typeName === null) {
				typeName = label.name;
			}
		}

		var type = typeName === null ? null : labels.types.filter(x => x.id === typeName)[0];
		this.logInfo([user, repository, issue.number], "Transforming issue '%s'/'%s' [%s]", category, phase.id, type === null ? "" : type.id);

		var convertedIssue: any = {
			title: issue.title,
			category: labels.categories.filter(x => x.id === category)[0],
			phase: phase,
			updated_at: issue.updated_at,
			milestone: issue.milestone ? issue.milestone.number : null,
			type: type || { name: null, id: null, color: null },
			pull_request: issue.pull_request,
			number: issue.number,
			compareUrl: this.getCompareUrl(user, repository, phase.id, issue.branch),
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