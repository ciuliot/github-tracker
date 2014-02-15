/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>
/// <reference path='../../../interfaces/knockout.mapping/knockout.mapping.d.ts'/>

import ko = require("knockout");
import knockout_mapping = require("knockout.mapping");
import $ = require("jquery");

export class Label {
	name: KnockoutObservable<string>;
	color: KnockoutObservable<string>;
	id: KnockoutObservable<string>;

	static empty: any = { id: null, name: null, color: null };
};

export interface PhasesDeclaration {
	backlog(): string;
	onhold(): string;
	inprogress(): string;
	implemented(): string;
	closed(): string;
}

export interface LabelsDeclaration {
	phases: KnockoutObservable<PhasesDeclaration>;
}

export interface Labels {
	phases: KnockoutObservableArray<Label>;
	categories: KnockoutObservableArray<Label>;
	types: KnockoutObservableArray<Label>;
	declaration: KnockoutObservable<LabelsDeclaration>;
}

export class LabelsViewModel {
	labels: KnockoutObservable<Labels>;

	constructor(data: string, loadingCount: KnockoutObservable<number>) {
		data = $.extend(true, {}, { 
			phases: [], 
			categories: [], 
			types: [],
			declaration: {
				phases: null,
				types: [],
				categories: []
			} 
		}, data);

		this.labels = knockout_mapping.fromJS(data, {
				create: (options: any) => {
					return ko.observable(knockout_mapping.fromJS(options.data, {
						declaration: {
							create: (options: any) => {
								return ko.observable(knockout_mapping.fromJS(options.data));
							}
						}
					}));
				}
			}).extend({ 
			mapToJsonResource: { 
				url: "/labels",
				loadingCount: loadingCount,
				loadOnStart: false
			}
		});
	}

	removeAll() {
		this.labels().phases.removeAll();
		this.labels().categories.removeAll();
	}
};
