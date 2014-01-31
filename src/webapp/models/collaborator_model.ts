/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>

interface CollaboratorModel {
	id:KnockoutObservable<number>;
	login: KnockoutObservable<string>;
	avatar_url: KnockoutObservable<string>;
	name: KnockoutObservable<string>;
}

export = CollaboratorModel;