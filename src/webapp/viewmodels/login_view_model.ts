/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>
/// <reference path='../../../interfaces/jquery/jquery.d.ts'/>

import ko = require("knockout");
import $ = require("jquery");

import utilities = require("../utilities");

class LoginViewModel {
	constructor() {
		utilities.getLogger("LoginViewModel").info("All done");
	}
}

$(() => {
	new LoginViewModel();
});