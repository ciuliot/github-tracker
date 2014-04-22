/// <reference path='../../interfaces/node/node.d.ts'/>
/// <reference path='../../interfaces/locomotive/locomotive.d.ts'/>
/// <reference path='../../interfaces/log4js/log4js.d.ts'/>
/// <reference path='../../interfaces/async/async.d.ts'/>
/// <reference path='../../interfaces/socket.io/socket.io.d.ts'/>

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
import socketio = require('socket.io');
import async = require('async');

var diveSync = require('diveSync');
var http = require('http');
var bootable = require('bootable');
var bootable_enviromnent = require('bootable-environment');
var cookie = require("cookie");
var connect = require("connect");
var GitHubApi = require("github");

class Server {
    private logger: log4js.Logger;

    /** 
    * @method constructor
    */
    constructor() {
        this.logger = log4js.getLogger('Server');

        /* istanbul ignore if */
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

    startHttpServer(): Function {
      var options: any = {};
      var self = this;

      return function httpServer(done: Function) {
        var app = http.createServer(this.express).listen(configuration.http_port, configuration.http_address, function() {
          var addr = this.address();
          console.info('HTTP server listening on %s:%d', addr.address, addr.port);
          return done();
        });

        self.logger.info("Starting Socket.IO");
        configuration.socketIO = socketio.listen(app);
        configuration.socketIO.set('log level', 1);

        configuration.socketIO.configure(() => {
            var authorization = (handshakeData: any, callback: Function) => {
                if (handshakeData.headers.cookie) {
                    handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
                    var sid = handshakeData.cookie['connect.sid'];
                    var sessionId = connect.utils.parseSignedCookie(sid, configuration.sessionStore.secret);

                    if (sessionId) {  
                        configuration.sessionStore.store.get(sessionId, (err: any, data: any) => {
                            if (data && data.passport && data.passport.user) {
                                handshakeData.session = data.passport.user;
                                callback(null, true);
                            } else {
                                callback("No such user found", false);
                            }
                        });
                    } else {
                        callback("Invalid session id", false);
                    }
                } else {
                    callback("No cookies provided", false);
                }
            };

            configuration.socketIO.set("authorization", authorization);
        });

        configuration.socketIO.sockets.on('connection', (socket: any) => {
            self.logger.debug("Socket.IO connection from %s", socket.id);

            socket.on("subscribe", (data: any) => {
                self.logger.debug("Attempt to subscribe to %s/%s", data.user, data.repository);

                var requestBody = {
                    user: data.user,
                    repo: data.repository
                };

                var github: any = new GitHubApi({
                    version: "3.0.0",
                    debug: false,
                    protocol: "https",
                    host: "api.github.com",
                    timeout: 5000
                });

                github.authenticate({ type: "oauth", token: socket.handshake.session.accessToken });

                async.waterfall([
                    (getRepositoryCompleted: Function) => {
                        github.repos.get(requestBody, getRepositoryCompleted);
                    },
                    (repository: any, subscribeToRoom: Function) => {
                        if (!repository) {
                            subscribeToRoom("Access denided");
                        } else {
                            socket.join(util.format("%s/%s", data.user, data.repository));
                            subscribeToRoom(null);
                        }
                    }
                ], (err: any) => {
                    if (err) {
                        self.logger.error("Error occured during subscription", err);
                    } else {
                        self.logger.info("Succesfully subscribed");
                    }
                });
            });
        });
      };
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
        locomotive.phase(this.startHttpServer());

        locomotive.boot(configuration.environment, (err: String) => {
            /* istanbul ignore else */
            if (!err) {
                self.logger.debug("Server initialized at : %s:%d", configuration.http_address, configuration.http_port);
                locomotive.use(locomotive.router);
            } else {
                self.logger.error("Error occured during initialization", err);
            }

            callback(err, self);
        });
    }
}

export = Server;