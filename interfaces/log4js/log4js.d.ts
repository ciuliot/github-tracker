interface LoggerStatic {
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

    exception(format: string, ...data: any[]) : string;
    exception(data: any) : string;

    fatal(format: string, ...data: any[]) : void;
    fatal(data: any) : void;

    trace(format: string, ...data: any[]) : void;
    trace(data: any) : void;

    setLevel(level: number): void;
    addAppender(appender: AppenderStatic): void;
}

interface LevelStatic {
    ALL: number;
}

interface AppenderStatic {
    setLayout(layout: LayoutStatic): void;
}

interface ConsoleAppenderStatic extends AppenderStatic {

}

interface BrowserConsoleAppenderStatic extends AppenderStatic {

}

interface LayoutStatic {

}

interface BasicLayoutStatic extends LayoutStatic {

}

declare module "log4js" {
    export interface Logger extends LoggerStatic {}

    export function getLogger(name: string): LoggerStatic;
    export function configure(options: any): void;

    export var Level: LevelStatic;

    export var BrowserConsoleAppender: {
        prototype: BrowserConsoleAppenderStatic;
        new(): BrowserConsoleAppenderStatic;
    }

    export var BasicLayout: {
        prototype: BasicLayoutStatic;
        new(): BasicLayoutStatic;
    }
}
