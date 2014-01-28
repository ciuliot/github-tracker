/// <reference path='../../../interfaces/async/async.d.ts'/>

import abstractController = require("./abstractController");
import async = require("async");
import util = require("util");

import configuration = require('../config/configuration');

interface Label {
	name?: string;
	color?: string;
	id: string;
};

interface IndexResult {
	phases: Label[];
	categories: Label[];
	declaration: any;
};

class LabelsController extends abstractController {
	constructor() {
		super("labels");

		this.ensureLogin("*");
	}

	index() {
		var self = this;

		var user = self.param("user");
		var repository = self.param("repository");

		this.getLabels(this, user, repository, (err, result) => {
			self.logger.debug(result);
			self.jsonResponse(err, result);
		});
	}

	getLabels(controller: abstractController, user:string, repository: string, callback: (err: any, result: IndexResult) => void) {
		controller.logger.info("Loading labels for repository '%s/%s'", user, repository);

		async.waterfall([
			(getAllLabels: Function) => { 
				controller.getGitHubClient().issues.getLabels({
					user: user,
					repo: repository
				}, getAllLabels); 
			}
			], (err: any, allLabels: any[]) => {
				var categories = allLabels.filter((x: any) => { 
					return configuration.categoryRegEx.exec(x.name) !== null;
				});
				var phases = allLabels.filter((x: any) => {
					return configuration.phaseRegEx.exec(x.name) !== null;
				});

				var result: IndexResult = {
					categories: categories.map((x: any) => { return { color: "#" + x.color, id: x.name } }),
					phases: phases.map((x: any) => { return { color: "#" + x.color, id: x.name } }),
					declaration: {
						phases: configuration.phaseNames,
						defaultCategory: configuration.defaultCategoryName
					}
				};

				result.categories.push({ id: configuration.defaultCategoryName });
				result.phases.unshift({ id: configuration.phaseNames.backlog });
				result.phases.push({ id: configuration.phaseNames.closed });

				controller.logger.debug(result);

				result.categories = result.categories.map(x => { 
					x.name = configuration.categoryRegEx.exec(x.id)[0];
					return x;
				});

				result.phases = result.phases.map(x => { 
					x.name = configuration.phaseRegEx.exec(x.id)[0];
					return x;
				});

				callback(err, result);
			}
		);
	}
}

var instance: any = new LabelsController();
export = instance;