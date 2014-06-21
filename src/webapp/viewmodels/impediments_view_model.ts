/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>
/// <reference path='../../../interfaces/knockout.mapping/knockout.mapping.d.ts'/>

import ko = require("knockout");
import knockout_mapping = require("knockout.mapping");
import $ = require("jquery");

export class Impediment {
	isClosed: KnockoutObservable<boolean>;
	date: KnockoutObservable<string>;
	comment: KnockoutObservable<string>;

	static empty: any = { isClosed: null, date: null, comment: null };

	constructor(data: string) {
		data = $.extend(true, {}, Impediment.empty, data);

		knockout_mapping.fromJS(data, {}, this);
	}
};

export class Issue {
	number: KnockoutObservable<string>;
	title: KnockoutObservable<string>;
	html_url: KnockoutObservable<string>;

	impediments: KnockoutObservableArray<Impediment>;

	static empty: any = { number: null, title: null, html_url: null, impediments: null };

	constructor(data: string) {
		data = $.extend(true, {}, Issue.empty, data);

		knockout_mapping.fromJS(data, {
			impediments: { 
				create: (options: any) => {
					return new Impediment(options.data); 
				}
			}
		}, this);
	}
};

export class ImpedimentsData {
	issues: KnockoutObservableArray<Issue>;

	constructor(data: any) {
		var self = this;
		data = $.extend(true, {	issues: [] }, data);

		knockout_mapping.fromJS(data, {
			issues: {
				key: (data: Issue) => {
					return ko.utils.unwrapObservable(data.number);
				},
				create: (options: any) => {
					return self.createIssueFromJS(options.data);
				}
			}
		}, this);
	}

	createIssueFromJS(data: any = {}) {
		return new Issue(data);
	}
}

export class ImpedimentsViewModel {
	impedimentsData: KnockoutObservable<ImpedimentsData>;

	constructor(loadingCount: KnockoutObservable<number>) {
		var mapping = {
			create: (options: any) => {
				return ko.observable(new ImpedimentsData(options.data)); 
			}
		};
		this.impedimentsData = knockout_mapping.fromJS(undefined, mapping);

		this.impedimentsData.extend({ 
			mapToJsonResource: { 
				url: "/impediments",
				loadingCount: loadingCount,
				loadOnStart: false
			}
		});
	}
};
