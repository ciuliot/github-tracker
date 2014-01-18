interface Logger {
    log(format: string, ...data: any[]) : void;
    log(data: any) : void;    
    debug(format: string, ...data: any[]) : void;    
    debug(data: any) : void;
    info(format: string, ...data: any[]) : void;
    info(data: any) : void;
    warn(format: string, ...data: any[]) : void;
    warn(data: any) : void;
    error(format: string, ...data: any[]) : void;
    error(data: any) : void;
}

interface ClientLogger extends Logger {
    addAppender(appender: number): void;
    setLevel(level: number): void;
    setLayout(layou: number): void;

    exception(format: string, ...data: any[]) : string;
    exception(data: any) : string;

    fatal(format: string, ...data: any[]) : void;
    fatal(data: any) : void;

    trace(format: string, ...data: any[]) : void;
    trace(data: any) : void;
}

declare module "log4js" {
    export function getLogger(name: string): Logger;
    export function configure(options: any): void;    
}

// Client implementation

interface ClientLog4js {
    getLogger(name: string): ClientLogger;    

    ConsoleAppender: any;
    BrowserConsoleAppender: any;
    Level: any;
    BasicLayout: any;
    PatternLayout: any;
}

declare var Log4js: ClientLog4js;