/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>
/// <reference path='../../../interfaces/knockout.mapping/knockout.mapping.d.ts'/>

import ko = require("knockout");
import knockout_mapping = require("knockout.mapping");

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
	phases: PhasesDeclaration;
}

export interface Labels {
	phases: KnockoutObservableArray<Label>;
	categories: KnockoutObservableArray<Label>;
	types: KnockoutObservableArray<Label>;
	declaration: LabelsDeclaration;
}

export class LabelsViewModel {
	labels: KnockoutObservable<Labels>;

	constructor(data: string, loadingCount: KnockoutObservable<number>) {
		this.labels = knockout_mapping.fromJS({ phases: [], categories: [], types: [] }, {
				create: (options: any) => {
					return ko.observable(knockout_mapping.fromJS(options.data));
				}
			}).extend({ 
			mapToJsonResource: { 
				url: "/labels",
				loadingCount: loadingCount,
				loadOnStart: false,
				indexDone: () => {
					console.log(this);
				}
			}
		});
	}

	removeAll() {
		this.labels().phases.removeAll();
		this.labels().categories.removeAll();
	}
};
