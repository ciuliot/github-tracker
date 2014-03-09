/// <reference path='../../../interfaces/async/async.d.ts'/>

import abstractController = require("./abstractController");
import async = require("async");
import util = require("util");

import configuration = require('../config/configuration');

class CommentsController extends abstractController {
	constructor() {
		super("comments");

		this.ensureLogin("*");
	}

	update() {
		var self = this;
		var requestBody = {
			user: self.param("user"),
			repo: self.param("repository"),
			number: self.param("id"),
			body: self.param("description")
		};

		if (!requestBody.user) {
			self.jsonResponse("Parameter 'user' was not provided");
		} else if (!requestBody.repo) {
			self.jsonResponse("Parameter 'repository' was not provided");
		} else if (!requestBody.body) {
			self.jsonResponse("Parameter 'description' was not provided");
		} else {
			self.logInfo([requestBody.user, requestBody.repo, requestBody.number], "Loading comments");

			async.waterfall([
				(createCommentCompleted: Function) => {
					self.logger.debug("Adding comment to issue #%d", requestBody.number);
					self.getGitHubClient().issues.createComment(requestBody, createCommentCompleted);
				}
			], (err: any, result: any) => {
				/* istanbul ignore next */ 
				if (err) {
					self.logger.error("Error occured during impediments retrieval", err);	
				} 

				self.jsonResponse(err, result);
			});	
		}
	}
}

var instance: any = new CommentsController();
export = instance;