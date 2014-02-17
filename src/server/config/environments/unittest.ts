import configuration = require("../configuration");
import mongoose = require('mongoose');
import log4js = require('log4js');

import testModels = require('../../models/test_models');

class TestDataFactory {
	static logger = log4js.getLogger("TestData");
	user = {
		get(data: any, callback: Function) { TestDataFactory.getOne(testModels.UserGetModel, data, callback); }
	};
	repos = {
		getCollaborators(data: any, callback: Function) { TestDataFactory.get(testModels.ReposGetCollaboratorsModel, data, callback); }
	};
	issues = {
		getAllMilestones(data: any, callback: Function) { TestDataFactory.get(testModels.IssuesGetAllMilestonesModel, data, callback); },
		getLabels(data: any, callback: Function) { TestDataFactory.get(testModels.IssuesGetLabelsModel, data, callback); }
	};

	constructor() { 
		TestDataFactory.logger.info("Data factory started");
	}

	authenticate(data: any) {
		TestDataFactory.logger.info("Authenticating with %s: %s", data.type, data.token);
	}

	static get(model: mongoose.IMongooseSearchable, args: any, callback: Function) {
		model.find(args, (err:any, data:any[]) => {
			/* istanbul ignore else */
			if (!err) {
				data = data.map( (x: any) => { return x.result });
			}
			callback(err, data);
		});
	}

	static getOne(model: mongoose.IMongooseSearchable, args: any, callback: Function) {
		model.findOne(args, (err:any, data:any) => {
			/* istanbul ignore else */
			if (!err) {
				data = data.result;
			}
			callback(err, data);
		});
	}
}

function initialize() {
    var server = this;
    configuration.dataFactory = (): any => { 
        return new TestDataFactory();
    };
};

export = initialize;