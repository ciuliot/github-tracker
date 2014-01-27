/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>

export interface Label {
	name?: KnockoutObservable<string>;
	color?: KnockoutObservable<string>;
	id: KnockoutObservable<string>;
};

export interface Labels {
	phases: KnockoutObservableArray<Label>;
	categories: KnockoutObservableArray<Label>;
};
