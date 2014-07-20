/// <reference path='../../interfaces/knockout/knockout.d.ts'/>
/// <reference path='../../interfaces/knockout.mapping/knockout.mapping.d.ts'/>
/// <reference path='../../interfaces/mapper.d.ts'/>

import log4js = require("log4js");
import ko = require("knockout");
import knockout_mapping = require("knockout.mapping");
import utilities = require("utilities");

interface KnockoutJsonCacheOptions {
	url: string;
	mapping: any;
	indexDone: Function;
	loadOnStart: boolean;
	loadingCount: KnockoutObservable<number>;
	savingCount: KnockoutObservable<number>;
	refreshAfterUpdate: boolean;
	keyIgnoreArgs: string[];
	setId: Function;
	findById: Function;
	loadMerge: Function;
};

class KnockoutJsonCache<T> {
	private lastTemporaryId: number = 0;
	private logger: JSNLogLogger;
	private lastIndexUrl: string;
	private storeQueue: any[] = [];
	private isStoring: boolean;
	private static pointerKeyword: string = "pointer";

	constructor(private target: KnockoutObservable<T>, private options: KnockoutJsonCacheOptions) {
		var self = this;
		options.mapping = options.mapping || {};
		options.indexDone = options.indexDone || function () {};
		options.loadOnStart = typeof(options.loadOnStart) === "undefined" ? true : options.loadOnStart;
		options.loadingCount = options.loadingCount || ko.observable(0); 
		options.savingCount = options.savingCount || ko.observable(0); 
		options.refreshAfterUpdate = typeof(options.refreshAfterUpdate) === "undefined" ? true : options.refreshAfterUpdate;
		options.keyIgnoreArgs = options.keyIgnoreArgs || [];
		options.setId = options.setId || ((where:any, id: number) => {
			where.id(id);
		});
		options.findById = options.findById || ((where: any, id: any) => {
			return ko.utils.arrayFirst(where, (x: any) => {
				return x.id == id;
			});
		});
		options.loadMerge = options.loadMerge || ((err: any, data: any) => {
			knockout_mapping.fromJS(data, self.options.mapping, self.target);
		});

		var initialData = knockout_mapping.toJSON(target);
		knockout_mapping.fromJSON(initialData, options.mapping, target);

		this.logger = utilities.getLogger("mapper." + options.url);

		if (options.loadOnStart) {
			utilities._deferredExtenderLoads.push(() => { self.load(); });
		}
	}

	private loadData(err: any, data: any) {
		this.options.loadMerge(err, data);
		this.options.indexDone(err, data);
	}

	private getStorageKey(operation: string, args: any): string {
		var publicArgs:any = {};
		for(var i in args) {
			if (this.options.keyIgnoreArgs.indexOf(i) < 0) {
				publicArgs[i] = args[i];
			}
		}
		return this.options.url + "/" + operation + "?" + JSON.stringify(publicArgs);
	}

	private getRequestKey(operation: string, args: any): string {
		return this.options.url + "/" + operation + "?" + JSON.stringify(args);
	}

	private executeNextInStoreQueue(): void {
		var self = this;
		this.options.savingCount(this.storeQueue.length);

		if(!this.isStoring && this.storeQueue.length > 0) {
			this.isStoring = true;

			var nextItem = this.storeQueue[0];

			$.ajax(nextItem.url, { type: nextItem.type, data: JSON.stringify(nextItem.data) })
				.done((data: any) => {
					if (self.lastIndexUrl !== null) {
						self.logger.debug("Updating data as: " + self.lastIndexUrl);
						sessionStorage.setItem(self.lastIndexUrl, nextItem.updatedData);

						var item = self.options.findById(self.target, nextItem.id);

						if (item !== null) {
							knockout_mapping.fromJS(data.result, item);

							// And finally merge and store updated object
							var wholeSet = knockout_mapping.fromJSON(nextItem.updatedData, self.options.mapping);
							var oldItem = self.options.findById(wholeSet, nextItem.id);

							knockout_mapping.fromJS(data.result, oldItem);

							var newSet = knockout_mapping.toJSON(wholeSet);
							sessionStorage.setItem(self.lastIndexUrl, newSet);
						} else {
							self.logger.warn("Item with id " + nextItem.id + " not found, skipping update");
						}
					}

					self.options.savingCount(self.storeQueue.length);

					self.storeQueue.splice(0, 1);
					self.isStoring = false;
					self.executeNextInStoreQueue();
				}).fail(() => {
					self.isStoring = false;
					window.setTimeout(() => {
						self.executeNextInStoreQueue();
					}, 5000);
				});
		}
	}

	load(args: any = {}, callback: Function = () => {}): void {
		var storageKey = this.getStorageKey("index", args);
		var storageData = sessionStorage.getItem(storageKey);

		var requestKey = this.getRequestKey("index", args);
		var requestData = sessionStorage.getItem(requestKey);

		var data: string;

		if (storageData !== null) {
			data = requestData === KnockoutJsonCache.pointerKeyword ? storageData : requestData;
		}

		if (data) {
			this.logger.debug("Loading from storage" + (requestData === KnockoutJsonCache.pointerKeyword ? requestKey : storageKey));
			var parsedData = JSON.parse(data);
			this.loadData(parsedData.err, parsedData);

			this.lastIndexUrl = storageKey;

			callback();
		} else {
			this.reload(args, callback);
		}
	}

	reload(args: any, callback: Function = () => {}): void {
		this.logger.debug("Reloading data with args: " + JSON.stringify(args));
		this.options.loadingCount(this.options.loadingCount() + 1);
		var self = this;

		$.get(self.options.url, args, (data:any) => {
			if (!data.err) {
				self.loadData(data.err, data.result);

				var storageKey = self.getStorageKey("index", args);
				self.logger.debug("Storing data as: " + storageKey);

				var requestKey = this.getRequestKey("index", args);
				if (storageKey != requestKey) {
					sessionStorage.setItem(requestKey, KnockoutJsonCache.pointerKeyword);
				}

				var rawData = knockout_mapping.toJSON(self.target);
				sessionStorage.setItem(storageKey, rawData);

				self.lastIndexUrl = self.options.url;
			}
		}).fail((error: string) => {
			self.options.indexDone(error);
			self.logger.error(error);
		}).always(() => {
			self.options.loadingCount(self.options.loadingCount() - 1);
			callback();
		});
	}

	updateItem(id: any, obj: any, args: any = {}): void {
		this.logger.debug("Queuing update for id " + id);
		var data = args;
		if (obj) {
			data.body = knockout_mapping.toJS(obj);
		}

		this.storeQueue.push({
			url: this.options.url + "/" + id,
			type: "PUT",
			id: id,
			updatedData: knockout_mapping.toJSON(this.target),
			data: data
		});

		this.executeNextInStoreQueue();
	}

	reloadItem(id: any, args: any = {}, callback: Function = () => {}): void {
		this.logger.debug("Getting item with id " + id);
		var data = args;

		this.options.loadingCount(this.options.loadingCount() + 1);
		var self = this;

		$.get(self.options.url + "/" + id, args, (data:any) => {
			if (!data.err) {
				var item = self.options.findById(self.target, id);

				if (item !== null) {
					knockout_mapping.fromJS(data.result, item);
					var storageKey = this.getStorageKey("index", args);

					var newSet = knockout_mapping.toJSON(self.target);
					sessionStorage.setItem(storageKey, newSet);
				} else {
					self.logger.debug("Item with id " + id + " not found, adding to collection");

					self.options.loadMerge(data.err, data.result);
				}
			}
		}).fail((error: string) => {
			self.options.indexDone(error);
			self.logger.error(error);
		}).always(() => {
			self.options.loadingCount(self.options.loadingCount() - 1);
			callback();
		});
	}

	createItem(obj: any, args: any = {}): void {
		this.lastTemporaryId--;

		this.logger.debug("Queuing insert of temporary id " + this.lastTemporaryId);
		var data = args;
		if (obj) {
			data.body = knockout_mapping.toJS(obj);
		}

		this.options.setId(obj, this.lastTemporaryId);

		this.storeQueue.push({
			url: this.options.url,
			type: "POST",
			id: this.lastTemporaryId,
			updatedData: knockout_mapping.toJSON(this.target),
			data: data
		});

		this.executeNextInStoreQueue();
	}
}

export function init(): void {
	ko.extenders.mapToJsonResource = (target: any, options: KnockoutJsonCacheOptions): any => {
		var cache = new KnockoutJsonCache(target, options);

		target.reload = (args: any, callback: Function) => {
			cache.reload(args, callback);
		};

		target.load = (args: any, callback: Function) => {
			cache.load(args, callback);
		};

		target.updateItem = (id: any, obj: any, args: any) => {
			cache.updateItem(id, obj, args);
		};

		target.createItem = (obj: any, args: any) => {
			cache.createItem(obj, args);
		};

		target.reloadItem = (obj: any, args: any) => {
			cache.reloadItem(obj, args);
		};

		return target;
	};
}