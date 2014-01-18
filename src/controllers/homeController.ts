/// <reference path='../../interfaces/locomotive.d.ts'/>

import abstractController = require("./abstractController");
import locomotive = require("locomotive");

class HomeController extends locomotive.Controller {
	constructor() {
		super();
	}

	index() {
		this.render();
	}
}

var instance: any = new HomeController();
export = instance;