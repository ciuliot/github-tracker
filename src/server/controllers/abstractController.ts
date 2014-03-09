/// <reference path='../../../interfaces/locomotive/locomotive.d.ts'/>
/// <reference path='../../../interfaces/log4js/log4js.d.ts'/>

/**
 * @namespace Server
 */

import locomotive = require("locomotive");
import log4js = require("log4js");
import util = require("util");
import configuration = require("../config/configuration");

var passport = require('passport');

var connectEnsureLogin = require('connect-ensure-login');

/**
 * Provides common functionality for all server controllers like unified logging and utility functions.
 * @class AbstractController
 * @constructor
 * @extends locomotive.Controller
 */
class AbstractController extends locomotive.Controller {
    /**
     * Provides Log4js compatible logger.
     * @property logger
     * @type log4js.Logger
     */
    logger: log4js.Logger;

    /**
     * @method constructor
     * @param name {String} Human-readable name of controller
     */
    constructor(private name: string) {
        super();

        this.logger = log4js.getLogger(name);
        this.logger.info("Starting controller %s", name);
    }

    /**
     * Returns response to caller of controller. Uses {{#crossLink "Server.ControllerResponse"}}{{/crossLink}} as formatting object.
     * @method jsonResponse
     * @param err {String} Indicates if there was error while performing operation in controller or `null` if operation was processed succesfully.
     * @param [result] {Object} Return value from controller.
     */
    jsonResponse(err: any, result?: any): void {
        this.res.json({ error: err, result: result });
    }

    getGitHubClient(): any {
        var dataFactory = configuration.dataFactory();

        dataFactory.authenticate({ type: "oauth", token: this.req.user.accessToken });
        return dataFactory;
    }

    ensureLogin(path: string): void {
        if (configuration.loginStrategy === "basic") {
            this.before(path, passport.authenticate(configuration.loginStrategy));
        }
        this.before(path, connectEnsureLogin.ensureLoggedIn("/login"));
    }

    private getLogFormat(params: string[], format: string) {
        var header = util.format("[%s] ", params.join("/"));
        return [header, format].join("");
    }

    logInfo(params: string[], format: string, ...args: any[]) {
        var format = this.getLogFormat(params, format);
        this.logger.info.apply(this.logger, [format].concat(args));  
    }

    logDebug(params: string[], format: string, ...args: any[]) {
        var format = this.getLogFormat(params, format);
        this.logger.debug.apply(this.logger, [format].concat(args));
    }

    logError(params: string[], format: string, ...args: any[]) {
        var format = this.getLogFormat(params, format);
        this.logger.error.apply(this.logger, [format].concat(args)); 
    }
}

export = AbstractController;
