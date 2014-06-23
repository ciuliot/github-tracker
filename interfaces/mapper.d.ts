/// <reference path="./knockout/knockout.d.ts" />

interface KnockoutObservable<T> {
	reload(args?: any, callback?: Function): any;
	load(args?: any, callback?: Function): any;
	updateItem(id: any, obj:any, args?: any) : void;
	createItem(obj:any, args?: any) : void;
	reloadItem(id:any, args?: any, callback?: Function) : void;
}

interface KnockoutExtenders {
	mapToJsonResource(target: any, options: any) : void;
}

interface KnockoutBindingHandlers {
	tooltip: KnockoutBindingHandler;
}