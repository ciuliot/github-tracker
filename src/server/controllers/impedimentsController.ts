/// <reference path='../../../interfaces/async/async.d.ts'/>
/// <reference path='../../../interfaces/moment/moment.d.ts'/>

import abstractController = require("./abstractController");
import async = require("async");
import util = require("util");
import fs = require("fs");
import path = require("path");

var moment: MomentStatic = require("moment");
var mustache: MustacheStatic = require("mustache");

import configuration = require('../config/configuration');

class ImpedimentsController extends abstractController {
	constructor() {
		super("impediments");

		this.ensureLogin("*");
	}

	show() {
		var self = this;
		var user = self.param("user"), repository = self.param("repository");
		var requestBody = {
			user: user,
			repo: repository,
			path: configuration.impedimentsFile
		};

		if (!user) {
			self.jsonResponse("Parameter 'user' was not provided");
		} else if (!repository) {
			self.jsonResponse("Parameter 'repository' was not provided");
		} else {
			self.logInfo([user, repository], "Loading impediments from file '%s'", configuration.impedimentsFile);

			async.waterfall([
				(getImpedimentsFileComplete: Function) => {
					self.getGitHubClient().repos.getContent(requestBody, getImpedimentsFileComplete);
				}
			], (err: any, result: any) => {
				/* istanbul ignore if */
				if (err) {
					self.logError([user, repository], "Error occured during impediments retrieval", err);	
				} else {
					result = new Buffer(result.content, "base64").toString("utf8");
				}

				self.jsonResponse(err, result);
			});	
		}
	}

	update() {
		var self = this;
		var user = self.param("user"), repository = self.param("repository"), number = self.param("id"), description = self.param("description");

		var requestBody: any = {
			user: user,
			repo: repository,
			number: number,
			body: description,
			path: undefined,
			message: undefined,
			sha: undefined,
			content: undefined
		};

		if (!user) {
			self.jsonResponse("Parameter 'user' was not provided");
		} else if (!repository) {
			self.jsonResponse("Parameter 'repository' was not provided");
		} else if (!description) {
			self.jsonResponse("Parameter 'description' was not provided");
		} else {
			var template: string, impediments: any;

			async.waterfall([
				(createCommentCompleted: Function) => {
					self.logInfo([user, repository, number], "Adding impediment comment");
					self.getGitHubClient().issues.createComment(requestBody, createCommentCompleted);
				}, 
				(comment: any, loadTemplateCompleted: (err: ErrnoException, data: any) => void) => {
					var filePath = path.resolve(configuration.templatesDir(), "impediments");
					self.logInfo([user, repository, number], "Loading impediments template from %s", filePath);
					fs.readFile(filePath, { encoding: 'utf8' }, loadTemplateCompleted);
				},
				(result: any, getImpedimentsFileComplete: Function) => {
					template = result;
					self.logInfo([user, repository, number], "Getting impediments file");
					requestBody.path = configuration.impedimentsFile;
					self.getGitHubClient().repos.getContent(requestBody, getImpedimentsFileComplete);
				},
				(result: any, getIssueCompleted: Function) => {
					impediments = result;
					self.getGitHubClient().issues.getRepoIssue(requestBody, getIssueCompleted);
				},
				(issue: any, updateImpedimentsFileComplete: Function) => {
					var fields: RegExpExecArray = null;
					var input = new Buffer(impediments.content, "base64").toString("utf8");
					var definition: any = {
						issues: []
					};

					while ( (fields = configuration.impedimentsFieldsRegEx.exec(input)) !== null) {
						if (fields[4] !== undefined) { // Impediment
							definition.issues[definition.issues.length - 1].impediments.push({
								isClosed: fields[4] === "~~",
								date: fields[5],
								comment: fields[6]
							});
						} else if (fields[1] !== undefined) { // Issue
							definition.issues.push({
								issueData: {
									number: fields[1],
									title: fields[2],
									html_url: fields[3]
								},
								impediments: []
							});
						}
					};

					var data: any = definition.issues.filter((x: any) => { return x.issueData.number == requestBody.number });

					if (data.length > 0) {
						data = data[0];
					} else {
						data = {
							issueData: issue,
							impediments: []
						};
						definition.issues.push(data);
					}

					data.impediments.push({
						date: moment().format(configuration.dateFormat),
						comment: requestBody.body
					});

					self.logger.debug(definition);
					
					var newContent = mustache.render(template, definition);

					self.logger.debug(newContent);

					requestBody.message = "Updated impediments";
					requestBody.sha = impediments.sha;
					requestBody.content = new Buffer(newContent, 'utf8').toString("base64");

					self.logInfo([user, repository, number], "Uploading new impediments file");

					self.getGitHubClient().repos.updateFile(requestBody, updateImpedimentsFileComplete);
				}
			], (err: any, result: any) => {
				/* istanbul ignore next */
				if (err) {
					self.logError([user, repository, number], "Error occured during impediments update", err);	
				} 

				self.jsonResponse(err, "OK");
			});	
		}

	}
}

var instance: any = new ImpedimentsController();
export = instance;