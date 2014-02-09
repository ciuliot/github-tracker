/// <reference path="./knockout/knockout.d.ts" />

interface KnockoutObservable<T> {
	reload(args?: any): any;
	load(args?: any): any;
	updateItem(id: any, obj:any, args?: any) : void;
	createItem(obj:any, args?: any) : void;
}

interface KnockoutExtenders {
	mapToJsonResource(target: any, options: any) : void;
}

interface KnockoutBindingHandlers {
	tooltip: KnockoutBindingHandler;
}