import http = require("http");
import util = require("util");

import configuration = require("../config/configuration");

class TestApi {
    static get(path: string) : Function {
        return function () {
            var self = this;
            var url = util.format("http://%s:%d%s", configuration.http_address, configuration.http_port, path);
			http.get(url, (data: any) => { 
				self.callback(null, data); 
			}).on("error", self.callback);
        };
    }
};

export = TestApi;