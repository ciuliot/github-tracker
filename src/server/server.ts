/// <reference path='../../interfaces/node/node.d.ts'/>
/// <reference path='../../interfaces/locomotive/locomotive.d.ts'/>
/// <reference path='../../interfaces/log4js/log4js.d.ts'/>

/**
 * @namespace Server
 */

import locomotive = require("locomotive");
import log4js = require("log4js");
import path = require("path");
import util = require("util");
import fs = require("fs");
import abstractController = require("./controllers/abstractController");
import configuration = require("./config/configuration");

var diveSync = require('diveSync');
var http = require('http');
var bootable = require('bootable');
var bootable_enviromnent = require('bootable-environment');

class Server {
    private logger: log4js.Logger;

    /** 
    * @method constructor
    */
    constructor() {
        this.logger = log4js.getLogger('Server');

        if (!fs.existsSync("logs")) {
            fs.mkdirSync("logs");
        }

        log4js.configure({
            appenders: [
                { type: 'console' },
                { type: 'file', filename: 'logs/app.log' }
            ]
        });
    }

    private loadControllers() {
        var self = this;
        var dir = path.resolve(configuration.startupDirectory, './dist/controllers');
        var exts = ['js'];
        var exception: any;

        diveSync(dir, function(err: Error, filePath: string) {
            if (exception) { return; }
            var regex = new RegExp('\\.(' + exts.join('|') + ')$');
            if (regex.test(filePath)) {
                var name = filePath.slice(dir.length + 1).replace(regex, '');
                self.logger.debug('Trying to register controller from file %s', name);
                try {
                    var type = require(filePath);
                    console.log(type);
                    var instance: locomotive.Controller;
                    var className: string;

                    for (var i in type) {
                        if (typeof (type[i]) === 'function') {
                            self.logger.debug("Found initialize function %s", i);

                            var tempObject: abstractController = new type[i](i);

                            if (tempObject.__beforeFilters && tempObject.__afterFilters) {
                                className = i;
                                instance = tempObject;
                                break;
                            }
                        }
                    }

                    if (!!instance) {
                        self.logger.debug("Registering controller class %s as %s", className, name);
                        locomotive._controller(name, instance);
                    }
                } catch (ex) {
                    self.logger.error(util.format("Exception occured during controller '%s' load", name), ex);
                    exception = ex;
                }
            }
        });
    }

    /**
    * Starts the server: </br>
    * <ul>
    * <li> boots the locomotive (process environment call, initializers and routes)
    * <li> configures and starts HTTPS server
    * <li> configures and starts HTTP server
    * </ul>
    * @method start
    * @param callback? {Function} (error?) Callback function to be called when the server sucesfully starts, or fails to start.
    * @param callback.error? {Any} Error status of starting the server.
    * @async
    */
    start(callback?: (error?: any, server?: Server) => void) {
        var self = this;
        configuration.logger = this.logger;
        callback = callback || function() {};

        this.logger.info("Application starting in %s", configuration.startupDirectory);

        var environmentsDir = path.resolve(configuration.startupDirectory, './dist/config/environments');
        var initializersDir = path.resolve(configuration.startupDirectory, './dist/config/initializers');
        var routesFile = path.resolve(configuration.startupDirectory, './dist/config/routes.js');
        var controllersDir = path.resolve(configuration.startupDirectory, './dist/controllers');

        this.logger.debug("Server environment: %s", configuration.environment);
        this.logger.debug("Initializers directory: %s", initializersDir);
        this.logger.debug("Enviromnents directory: %s", environmentsDir);
        this.logger.debug("Controllers directory: %s", controllersDir);
        this.logger.debug("Routes file: %s", routesFile);

        locomotive.phase(locomotive.boot.controllers(controllersDir));
        locomotive.phase(locomotive.boot.views());
        locomotive.phase(bootable_enviromnent({ dirname: environmentsDir, env: configuration.environment }));
        locomotive.phase(bootable.initializers(initializersDir));

        locomotive.phase(locomotive.boot.routes(routesFile));
        locomotive.phase(locomotive.boot.httpServer(configuration.http_port, configuration.http_address));

        locomotive.boot(configuration.environment, (err: String) => {
            if (!err) {
                locomotive.use(locomotive.router);
            }

            callback(err, self);
        });
    }
}

export = Server;