/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>

interface RepositoryModel {
	id: KnockoutObservable<string>;
	name: KnockoutObservable<string>;
}

export = RepositoryModel;