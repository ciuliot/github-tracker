/// <reference path='../../../interfaces/async/async.d.ts'/>

import async = require("async");
import util = require("util");

import abstractController = require("./abstractController");
import labelsModel = require("../models/labels_model");

import configuration = require('../config/configuration');

class LabelsController extends abstractController {
	constructor() {
		super("labels");

		this.ensureLogin("*");
	}

	index() {
		var self = this;

		var user = self.param("user");
		var repository = self.param("repository");

		this.getLabels(this, user, repository, (err, result?) => {
			self.jsonResponse(err, result);
		});
	}

	getLabels(controller: abstractController, user:string, repository: string, callback: (err: any, result?: labelsModel.IndexResult) => void) {
		if (!user) {
			callback("Parameter 'user' was not provided");
		} else if (!repository) {
			callback("Parameter 'repository' was not provided");
		} else {
			controller.logger.info("Loading labels for repository '%s/%s'", user, repository);

			async.waterfall([
				(getAllLabels: Function) => { 
					controller.getGitHubClient().issues.getLabels({
						user: user,
						repo: repository
					}, getAllLabels); 
				},
				(allLabels: labelsModel.Label[], convertLabelsCompleted: Function) => {
					try {
						var result: labelsModel.IndexResult = {
							categories: [],
							phases: [],
							types: [],
							declaration: {
								phases: configuration.phaseNames,
								defaultCategory: configuration.defaultCategoryName
							}
						};

						allLabels.push({ id: null, name: configuration.defaultCategoryName });
						allLabels.unshift({ id: null, name: configuration.phaseNames.backlog });
						allLabels.push({ id: null, name: configuration.phaseNames.closed });

						for (var i = 0; i < allLabels.length; i++) {
							var label: labelsModel.Label = allLabels[i];
							var category = configuration.categoryRegEx.exec(label.name);
							var phase = configuration.phaseRegEx.exec(label.name);
							var convertedLabel: labelsModel.Label = {
								color: label.color ? ("#" + label.color) : null,
								id: label.name,
								name: label.name
							};

							if (category !== null) {
								convertedLabel.name = category[1];
								result.categories.push(convertedLabel);
							} else if (phase !== null) {
								convertedLabel.name = phase[1];
								result.phases.push(convertedLabel);
							} else {
								result.types.push(convertedLabel);
							}
						}
						convertLabelsCompleted(null, result);
					} catch (ex) {
						/* istanbul ignore next */ 
						convertLabelsCompleted(ex);
					}
				}
				], (err: any, result: any) => {
					/* istanbul ignore if */ 
					if (err) {
						controller.logger.error("Error occured during labels retrieval");
					} 
						
					callback(err, result);
				}
			);
		}
	}
}

var instance: any = new LabelsController();
export = instance;