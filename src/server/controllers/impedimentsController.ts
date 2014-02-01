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
			number: self.param("id")
		};
	}
}

var instance: any = new ImpedimentsController();
export = instance;