/// <reference path='../../interfaces/log4js/log4js.d.ts'/>

import log4js = require("log4js");

class Utilities {
	static getLogger(category: string): log4js.Logger {
		var logger = log4js.getLogger(category);
		logger.setLevel(log4js.Level.ALL); 
		var appender = new log4js.BrowserConsoleAppender();
		appender.setLayout(new log4js.BasicLayout());

		logger.addAppender(appender);

		return logger; 
	}
}

export = Utilities;