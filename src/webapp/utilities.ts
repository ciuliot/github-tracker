/// <reference path='../../interfaces/log4js/log4js.d.ts'/>
/// <reference path='../../interfaces/knockout/knockout.d.ts'/>

import log4js = require("log4js");
import ko = require("knockout");

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

ko.extenders["mapToJsonResource"] = (target: any, options: any) => {
	var o = options;
	o = o || {};
	o.indexDone = o.indexDone || function () {};
	o.loadOnStart = typeof(o.loadOnStart) === "undefined" ? true : o.loadOnStart;
	o.loadingCount = o.loadingCount || function() {}; 

	var logger = Utilities.getLogger(options.url + " mapper");

	target.reload = (args?: any) => {
		logger.debug("Reloading data with args %o", args);
		o.loadingCount(o.loadingCount() + 1);

		$.get(options.url, args, (data:any) => {
			target.removeAll();
			for (var i = 0 ; i < data.result.length; i++) {
				target.push(data.result[i]);
			}
			o.indexDone(data.error, data.result);
		}).fail((error: string) => {
			o.indexDone(error);
			logger.error(error);
		}).always(() => {
			o.loadingCount(o.loadingCount() - 1);
		});
	};

	if (o.loadOnStart) {
		target.reload();
	}

	target.subscribe((newValue:any) => {
		logger.debug("got update");
	});

	return target;
};



export = Utilities;