/// <reference path='../../../interfaces/async/async.d.ts'/>

import abstractController = require("./abstractController");
import async = require("async");

class HomeController extends abstractController {
	private indexData: any;

	constructor() {
		super("home");

		this.ensureLogin("*");
	}

	index() {
		this.indexData = {
			userName: this.req.user.displayName,
			version: "0.1"
		};

		this.render();
	}
}

var instance: any = new HomeController();
export = instance;