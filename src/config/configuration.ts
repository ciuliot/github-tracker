/// <reference path='../../interfaces/node.d.ts'/>
/// <reference path='../../interfaces/log4js.d.ts'/>

import log4js = require("log4js");

class Configuration {
    /** 
     * Defines application startup directory used as base for other paths. 
     * @default Process startup directory. 
     * @property startupDirectory
     * @type {String}
     */
    static startupDirectory: string = process.cwd();
    /** 
     * Defines HTTPS address of server, uses environment value `HTTPS_ADDRESS` if available.
     * @default 0.0.0.0 
     * @property https_address
     * @type {String}
     */
    static http_address: string = process.env.HTTPS_ADDRESS || "0.0.0.0";
    /** 
    * Defines HTTPS port of server, uses environment value `HTTPS_PORT` if available.
    * @default 3110
    * @property https_port
    * @type {String}
    */
    static http_port: number = process.env.HTTPS_PORT || 3110;
    /** 
    * Defines server environment, uses environment value `NODE_ENV` if available.
    * @default production 
    * @property environment
    * @type {String}
    */
    static environment: string = process.env.NODE_ENV || 'production';
    /** 
    * Defines MongoDb database name for persistence storage. 
    * @default mongodb://localhost/_mongo-ui 
    * @property databaseName
    * @type {String}
    */
    static databaseName: string = "mongodb://localhost/_mongo-ui";
    /** 
     * Defines root-level logger. 
     * @property logger
     * @type {log4j.Logger}
     */
    static logger: Logger;
    /** 
     * Defines administrator password.
     * @property adminPassword
     * @default nbusr-123
     * @type {String}
     */
    static adminPassword: string = "nbusr-123";
}

export = Configuration;