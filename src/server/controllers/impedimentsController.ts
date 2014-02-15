/// <reference path='../../../interfaces/async/async.d.ts'/>

import abstractController = require("./abstractController");
import async = require("async");
import util = require("util");

import configuration = require('../config/configuration');

class ImpedimentsController extends abstractController {
	constructor() {
		super("impediments");

		this.ensureLogin("*");
	}

	show() {
		var self = this;
		var requestBody = {
			user: self.param("user"),
			repo: self.param("repository"),
			path: configuration.impedimentsFile
		};

		async.waterfall([
			(getImpedimentsFileComplete: Function) => {
				self.getGitHubClient().repos.getContent(requestBody, getImpedimentsFileComplete);
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

	update() {
		var self = this;
		var requestBody = {
			user: self.param("user"),
			repo: self.param("repository"),
			number: self.param("id"),
			body: self.param("description"),
			path: undefined
		};

		async.waterfall([
			(createCommentCompleted: Function) => {
				self.logger.debug("Adding impediment comment to issue #%d", requestBody.number);
				self.getGitHubClient().issues.createComment(requestBody, createCommentCompleted);
			}, 
			(comment: any, getImpedimentsFileComplete: Function) => {
				self.logger.debug("Getting impediments file");
				requestBody.path = configuration.impedimentsFile;
				self.getGitHubClient().repos.getContent(requestBody, getImpedimentsFileComplete);
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

var instance: any = new ImpedimentsController();
export = instance;