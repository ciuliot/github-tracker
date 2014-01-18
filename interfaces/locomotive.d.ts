/// <reference path='./express.d.ts'/>

declare module "locomotive" {
	import express = require("express");

	//export function boot(environment: string, callback: (err: any) => void): void;
	export function _controller(name: string, controller: any): void;
    export function phase(phase: Function): void;
    export function use(callback: Function): void;
    export function router(): void;
    export var boot: any;

	export class Controller {
    	res: express.Response;
    	req: express.Request;
        server: express.Application;

    	__beforeFilters: any[];
    	__afterFilters: any[];

    	param(name: string): any;
        render() : void;
        after(filter:string, callback: (err: any, req: express.Request, res: express.Response, next: Function) => void): void;

        urlFor(params: any) : string;
        redirect(to: string) : void;

        before(name: string, callback: (next: Function) => void): void;
    }
}