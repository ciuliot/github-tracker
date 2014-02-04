// Type definitions for Mustache 0.7
// Project: https://github.com/janl/mustache.js
// Definitions by: Boris Yankov <https://github.com/borisyankov/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped


interface MustacheScanner {
    string: string;
    tail: string;
    pos: number;

    eos(): boolean;
    scan(re: RegExp): string;
    scanUntil(re: RegExp): string;
}

interface MustacheContext {
    view: any;
    parent: any;

    clearCache(): void;
    push(view: any): MustacheContext;
    lookup(name: string): any;
}

interface MustacheWriter {
    (view: any): string;
    clearCache(): void;
    compile(template: string, tags: any): void;
    compilePartial(name:string, template: string, tags: any): void;
    compileTokens(tokens: any, template: any): void;
    render(template: any, view: any, partials: any): void;
}

interface MustacheStatic {
    name: string;
    version: string;
    tags: string;
    Scanner: MustacheScanner;
    Context: MustacheContext;
    Writer: MustacheWriter;
    escape: any;

    parse(template: string, tags: any): void;
    clearCache(): MustacheWriter;
    compile(template: string): MustacheWriter;
    compile(template: string, tags: any): MustacheWriter;
    compilePartial(name: string, template: string, tags: any): MustacheWriter;
    compileTokens(tokens: any, template: string): MustacheWriter;
    render(template: string, view: any, partials?: any): string;
    to_html(template: string, view: any, partials?: any, send?: any): string;
}

declare var Mustache: MustacheStatic;
