/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>

interface MilestoneModel {
	id: KnockoutObservable<string>;
	number?: KnockoutObservable<number>;
	state?: KnockoutObservable<string>;
	title: KnockoutObservable<string>;
	open_issues?: KnockoutObservable<number>;
	closed_issues?: KnockoutObservable<number>;
}

export = MilestoneModel;