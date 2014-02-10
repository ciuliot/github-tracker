/// <reference path='../../interfaces/log4js/log4js.d.ts'/>
/// <reference path='../../interfaces/knockout/knockout.d.ts'/>
/// <reference path='../../interfaces/knockout.mapping/knockout.mapping.d.ts'/>
/// <reference path='../../interfaces/jquery/jquery.d.ts'/>
/// <reference path='../../interfaces/mapper.d.ts'/>

import log4js = require("log4js");
import ko = require("knockout");
import knockout_mapping = require("knockout.mapping");

class Utilities {
	static _deferredExtenderLoads: Function[] = [];

	static loadMapper(): void {
		for (var i = 0; i < Utilities._deferredExtenderLoads.length; i++) {
			Utilities._deferredExtenderLoads[i]();
		}

		Utilities._deferredExtenderLoads = [];
	}

	static getLogger(category: string): log4js.Logger {
		var logger = log4js.getLogger(category);
		logger.setLevel(log4js.Level.ALL); 
		var appender = new log4js.BrowserConsoleAppender();
		appender.setLayout(new log4js.BasicLayout());

		logger.addAppender(appender);

		return logger; 
	}
}

ko.extenders.mapToJsonResource = (target: any, options: any = {}) : void => {
	var o = options;
	o.indexDone = o.indexDone || function () {};
	o.mapping = o.mapping || {};
	o.loadOnStart = typeof(o.loadOnStart) === "undefined" ? true : o.loadOnStart;
	o.loadingCount = o.loadingCount || function() {}; 
	o.savingCount = o.savingCount || function() {}; 
	o.refreshAfterUpdate = typeof(o.refreshAfterUpdate) === "undefined" ? true : o.refreshAfterUpdate;

	var lastTemporaryId = 0;
	o.setId = o.setId || ((where:any, id: number) => {
		where.id(id);
	});

	o.findById = o.findById || ((where: any, id: any) => {
		return ko.utils.arrayFirst(where, (x: any) => {
			return x.id == id;
		});
	});

	var initialData = knockout_mapping.toJSON(target);
	knockout_mapping.fromJSON(initialData, o.mapping, target);

	var logger = Utilities.getLogger(options.url + " mapper");
	var lastIndexUrl: string = null;

	var loadData = (err: any, data: any) => {
		knockout_mapping.fromJS(data, target);
		o.indexDone(err, data);
	}

	var getStorageKey = (operation: string, args: any) => {
		return o.url + "/" + operation + "?" + JSON.stringify(args);
	}

	var storeQueue: any[] = [];
	var isStoring: boolean;

	var executeNextInStoreQueue = () => {
		o.savingCount(storeQueue.length);

		if(!isStoring && storeQueue.length > 0) {
			isStoring = true;

			var nextItem = storeQueue[0];

			$.ajax(nextItem.url, { type: nextItem.type, data: nextItem.data })
				.done((data: any) => {
					if (lastIndexUrl !== null) {
						logger.debug("Updating data as: " + lastIndexUrl);
						sessionStorage.setItem(lastIndexUrl, nextItem.updatedData);

						var item = o.findById(target, nextItem.id);

						if (item !== null) {
							knockout_mapping.fromJS(data.result, item);

							// And finally merge and store updated object

							var wholeSet = knockout_mapping.fromJSON(nextItem.updatedData, o.mapping);
							var oldItem = o.findById(wholeSet, nextItem.id);

							knockout_mapping.fromJS(data.result, oldItem);

							var newSet = knockout_mapping.toJSON(wholeSet);
							sessionStorage.setItem(lastIndexUrl, newSet);
						}
					}

					o.savingCount(storeQueue.length);

					storeQueue.splice(0, 1);
					isStoring = false;
					executeNextInStoreQueue();
				}).fail(() => {
					isStoring = false;
					window.setTimeout(() => {
						executeNextInStoreQueue();
					}, 5000);
				});
		}
	};

	target.reload = (args: any = {}, callback: Function = () => {}) => {
		logger.debug("Reloading data with args: ", JSON.stringify(args));
		o.loadingCount(o.loadingCount() + 1);

		$.get(options.url, args, (data:any) => {
			if (!data.err) {
				loadData(data.err, data.result);

				var storageKey = getStorageKey("index", args);
				logger.debug("Storing data as: " + storageKey);
				sessionStorage.setItem(storageKey, JSON.stringify(data.result));

				lastIndexUrl = options.url;
			}
		}).fail((error: string) => {
			o.indexDone(error);
			logger.error(error);
		}).always(() => {
			o.loadingCount(o.loadingCount() - 1);
			callback();
		});
	};

	target.load = (args: any = {}, callback: Function = () => {}) => {
		var storageKey = getStorageKey("index", args);
		if (sessionStorage.getItem(storageKey) !== null) {
			logger.debug("Loading from session storage " + storageKey);
			var data = JSON.parse(sessionStorage.getItem(storageKey));
			loadData(data.err, data);

			lastIndexUrl = storageKey;

			callback();
		} else {
			target.reload(args, callback);
		}
	}

	target.updateItem = (id: any, obj: any, args: any = {}) => {
		logger.debug("Queuing update for id " + id);
		var data = args;
		if (obj) {
			data.body = knockout_mapping.toJS(obj);
		}

		storeQueue.push({
			url: options.url + "/" + id,
			type: "PUT",
			id: id,
			updatedData: knockout_mapping.toJSON(target),
			data: data
		});

		executeNextInStoreQueue();
	}

	target.createItem = (obj: any, args: any = {}) => {
		lastTemporaryId--;

		logger.debug("Queuing insert of temporary id " + lastTemporaryId);
		var data = args;
		if (obj) {
			data.body = knockout_mapping.toJS(obj);
		}

		o.setId(obj, lastTemporaryId);

		storeQueue.push({
			url: options.url,
			type: "POST",
			id: lastTemporaryId,
			updatedData: knockout_mapping.toJSON(target),
			data: data
		});

		executeNextInStoreQueue();
	}

	if (o.loadOnStart) {
		Utilities._deferredExtenderLoads.push(target.load);
	}

	return target;
};


export = Utilities;