/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>

interface CollaboratorModel {
	login: KnockoutObservable<string>;
	avatar_url: KnockoutObservable<string>;
}

export = CollaboratorModel;