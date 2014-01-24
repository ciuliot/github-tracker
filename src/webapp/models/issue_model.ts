/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>

interface IssueModel {
	id: KnockoutObservable<string>;
	number?: KnockoutObservable<number>;
	state?: KnockoutObservable<string>;
	title: KnockoutObservable<string>;
}

export = IssueModel;