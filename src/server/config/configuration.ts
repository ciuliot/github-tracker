/// <reference path='../../../interfaces/log4js/log4js.d.ts'/>
/// <reference path='../../../interfaces/node/node.d.ts'/>

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
     * @default 127.0.0.1 
     * @property https_address
     * @type {String}
     */
    static http_address: string = process.env.HTTP_ADDRESS || "127.0.0.1";
    /** 
    * Defines HTTPS port of server, uses environment value `HTTPS_PORT` if available.
    * @default 3110
    * @property https_port
    * @type {String}
    */
    static http_port: number = process.env.HTTP_PORT || 3110;
    /** 
    * Defines server environment, uses environment value `NODE_ENV` if available.
    * @default production 
    * @property environment
    * @type {String}
    */
    static environment: string = process.env.NODE_ENV || 'development';
    /** 
    * Defines MongoDb database name for persistence storage. 
    * @default mongodb://localhost/_mongo-ui 
    * @property databaseName
    * @type {String}
    */
    static databaseName: string = "mongodb://localhost/github-tracker";
    /** 
     * Defines root-level logger. 
     * @property logger
     * @type {log4j.Logger}
     */
    static logger: log4js.Logger;

    static phaseRegEx = /\#(.+)/;
    static categoryRegEx = /\@(.+)/;

    static phaseNames: any = { 
        backlog: "#backlog",
        onhold: "#onhold", 
        inprogress: "#inprogress", 
        implemented: "#implemented", 
        closed: "#closed" 
    };

    static defaultCategoryName: string = "@other";

    // See http://developer.github.com/v3/git/refs/#create-a-reference for format
    // Prefix /refs/heads is added automatically
    static branchNameFormat: string = "issue/%d";

    static estimateSizes: any = {
        XS: 1,
        SM: 2,
        M: 3,
        L: 5,
        XL: 8
    };

    static impedimentsFile: string = "impediments.md";

    static githubApplication: any = {
        clientID: process.env.GITHUB_CLIENT_ID || "39796dadb4d9d2a45354",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "69e659d98975cbdf854e9403ae2ffbee60911194",
        dnsName: null,
        scope: ["user", "repo"]
    };

     static bodyFieldsSeparator: string = "***";

    // Matches format of body fields (also multilines), e.g.
    /* __Estimate:__ XXL
        __Size:__ blah
        __Steps:__
        1. Test
        2. Test
        __List:__
        * Test
        * Test
        __Estimate:__ XXL
        ***
        */
    static bodyFieldsRegEx = /__(.+?):__([\s\S]*?)(?=__|\*\*\*)/;
}

export = Configuration;