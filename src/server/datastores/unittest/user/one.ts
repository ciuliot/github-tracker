import testModels = require('../../../models/test_models');

var model = new testModels.UserGetModel({
	result: {
		id: 1,
		name: "Tester Unit",
		login: "utester",
		avatar_url: "http://void.com/image.gif"
	}
});

export = model;