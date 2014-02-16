import http = require("http");
import util = require("util");

import configuration = require("../config/configuration");

class TestApi {
    static getTest(path: string, auth?: string) : Function {
        return function (args: any) {
            var self = this;

            TestApi.get(path, this.callback, auth, args);
        };
    }

    static get(path: string, callback: Function, auth: string = "tester:123", args?: any) :void {
        var options = {
        	host: configuration.http_address,
        	port: configuration.http_port,
        	path: path,
        	method: "GET",
        	auth: auth
        };
        
		var req = http.request(options, (res: any) => { 
            console.log(args);
            res.on("data", () => {});
			callback(undefined, res, args); 
		});

		req.on("error", (err: any) => { 
			callback(err, undefined, args); 
		});

		req.end();
    }
};

export = TestApi;