///<reference path='./node.d.ts' />

declare function emit(key:any, value:any) : void;

declare module "mongoose" {
	export function connect(uri: string, options?: ConnectOptions) : void;
    export var connection: Connection;
    export var Schema: any;
    export function model(name:string, obj: MongooseSchema) : any;

    export interface ConnectOptions {
        db?: any;
        server?: any;
        replset?: any;
        user?: string;
        pass?: string;
        auth?: string;
    }

    export interface Connection extends EventEmitter {
        collections: any[];
        base: any;
        db: any;
    }

    export interface MongooseSchema extends IMongooseSearchable {        
        new() : MongooseSchema;
        save(callback: (err: any, result?: any) => void): void;
    }
     
    interface IWhere{
        equals(value:String):IChainable;
        gt(value:String):IChainable;
        lt(value:String):IChainable;
        in(value:String[]):IChainable;
    }
     
    interface IChainable{
        exec(item:(error:string, item:any) => void) : IChainable;
        populate(...args: any[]) : IChainable;
        select(query:string):IChainable;
        limit(num:Number):IChainable;
        sort(field:String):IChainable;
        where(selector:String):IWhere;
    }
    
    interface IMapReduceOptions{
        map() : void;
        reduce(key:any, values:any[]) : any;
        out: any;
        query?: any;
        sort?: any;
        limit?: number;
        finalize?(key: any, reducedValues: any[]): any;
        scope?: any;
        jsMode?: boolean;
        verbose?: boolean;
    }

    interface IMongooseSearchable {
        new() : IMongooseSearchable;
        findOne(item:any, callback: (error:string, item:any) => void) : void;
        findOne(item:any, fields:any, callback: (error:string, item:any) => void) : void;
        find(id:string, callback?: (error:string, item:any) => void) : IChainable;
        find(propBag:Object, callback?: (error:string, item:any) => void) : IChainable;
        find(propBag:Object, fields:any, callback?: (error:string, item:any) => void) : IChainable;
        remove(item:any, callback:(item:string) => void) : void;  
        update(item:any, operations:any, callback:(item:string) => void) : void;  
        aggregate(pipeline:any[], callback: (error:string, item:any) => void) : void;
        mapReduce(options: IMapReduceOptions, callback: (error:string, item:any) => void) : void;
    }
     
    interface IMongooseBase {   
        save(item: () => void) : void;
        push(item:IMongooseBase):void;
    }
}