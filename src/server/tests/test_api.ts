/// <reference path='../../../interfaces/should/should.d.ts'/>

import http = require("http");
import util = require("util");
import server = require("../server");
import log4js = require('log4js');

import configuration = require("../config/configuration");
var request = require('request');

import should = require("should");

var serverStartupCallbacks: Function[] = [];
var isServerStarting = false;

class TestApi {
    static logger = log4js.getLogger("TestApi");

    static startServer(callback: Function) {
        if (serverStartupCallbacks !== null) {
            serverStartupCallbacks.push(callback);
        } else {
            callback();
        }

        if (!isServerStarting) {
            isServerStarting = true;

            TestApi.logger.info("Starting server ...");
            configuration.loginStrategy = "basic";
            configuration.environment = "unittest";

            new server().start((err?:any, server?:server) => {
                for(var i=0; i < serverStartupCallbacks.length; i++) {
                    serverStartupCallbacks[i](err);
                }

                serverStartupCallbacks = null;

            });
        } else {
            TestApi.logger.warn("Server already starting, waiting for signal ...");
        }
    }

    static startServerTopic() : Function {
        return function () {
            var self = this;
            TestApi.startServer(self.callback);
        };
    }

    static httpGetTopic(path: string, auth?: string) : Function {
        return function (args: any) {
            var self = this;

            TestApi.httpGet(path, this.callback, auth, args);
        };
    }

    static httpPostTopic(path: string, args?: any, auth?: string) : Function {
        return function () {
            var self = this;

            TestApi.httpPost(path, this.callback, args, auth);
        };
    }

    static httpPutTopic(path: string, args?: any, auth?: string) : Function {
        return function () {
            var self = this;

            TestApi.httpPut(path, this.callback, args, auth);
        };
    }

    static verifyJsonResponse(err: any, response: http.ClientResponse, textBody: string): any {
        should.not.exist(err);
        response.should.have.status(200);
        should.exist(textBody);
        var body = JSON.parse(textBody);

        should.not.exist(body.error);
        should.exist(body);
        should.exist(body.result);

        return body.result;
    }

    static verifyErrorJsonResponse(errorText: string): any {
        return (err: any, response: http.ClientResponse, textBody: string) => {
            should.not.exist(err);
            response.should.have.status(200);
            should.exist(textBody);

            var body = JSON.parse(textBody);
            should.exist(body.error);
            body.error.should.eql(errorText);

            return body;
        }
    }

    static verifyAccessDeniedError(): any {
        return TestApi.verifyErrorJsonResponse("Access denied");
    }

    static verifyNoParameterProvidedError(parameterName: string): any {
        return TestApi.verifyErrorJsonResponse("Parameter '" + parameterName + "' was not provided");
    }

    static verifyNoUserProvidedError(): any {
        return TestApi.verifyNoParameterProvidedError("user");
    }

    static verifyNoRepositoryProvidedError(): any {
        return TestApi.verifyNoParameterProvidedError("repository");
    }

    static httpGet(path: string, callback: Function, auth: any = { user: "tester", pass: "123", }, args?: any) :void {
        var options = {
        	url: util.format("http://%s:%d%s", configuration.http_address, configuration.http_port, path),
        	method: "GET",
        	auth: auth
        };
        
		request.get(options, callback);
    }

    static httpPost(path: string, callback: Function, args?: any, auth: any = { user: "tester", pass: "123", }) :void {
        var options = {
            url: util.format("http://%s:%d%s", configuration.http_address, configuration.http_port, path),
            method: "POST",
            auth: auth,
            form: args
        };
        
        request.get(options, callback);
    }

    static httpPut(path: string, callback: Function, args?: any, auth: any = { user: "tester", pass: "123", }) :void {
        var options = {
            url: util.format("http://%s:%d%s", configuration.http_address, configuration.http_port, path),
            method: "PUT",
            auth: auth,
            form: args
        };
        
        request.get(options, callback);
    }
};

export = TestApi;