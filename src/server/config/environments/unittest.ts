import configuration = require("../configuration");
import mongoose = require('mongoose');
import log4js = require('log4js');

import testModels = require('../../models/test_models');

class TestDataFactory {
	logger = log4js.getLogger("TestData");
	user = {
		get(data: any, callback: Function) { TestDataFactory.getOne(testModels.UserGetModel, data, callback); }
	};

	constructor() { }

	authenticate(data: any) {
		this.logger.info("Authenticating with %s: %s", data.type, data.token);
	}

	static getOne(model: mongoose.IMongooseSearchable, data: any, callback: Function) {
		model.findOne(data, (err:any, data:any) => {
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