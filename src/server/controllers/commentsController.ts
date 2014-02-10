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

		async.waterfall([
			(createCommentCompleted: Function) => {
				self.logger.debug("Adding comment to issue #%d", requestBody.number);
				self.getGitHubClient().issues.createComment(requestBody, createCommentCompleted);
			}
		], (err: any, result: any) => {
			if (err) {
				self.logger.error("Error occured during impediments retrieval", err);	
			} else {
				self.logger.debug(result);
			}

			self.jsonResponse(err);
		});	

	}
}

var instance: any = new CommentsController();
export = instance;