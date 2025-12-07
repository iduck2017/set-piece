import { Method } from "../types";

export enum DebugLevel {
    VERBOSE = 0,
    INFO,
    WARN,
    ERROR,
    FATAL,
}

export class DebugService {
    private static isMute: boolean = false;

    public static level: DebugLevel = DebugLevel.INFO;

    private static indent: number = 0;

    private static _stack: string[] = [];
    public static get stack(): Readonly<string[]> {
        return [...DebugService._stack];
    }

    private static console = {
        log: console.log,
        dir: console.dir,
        info: console.info,
        warn: console.warn,
        debug: console.debug,
        group: console.group,
        groupEnd: console.groupEnd,
    }

    public static span<T extends Object>(origin?: string, level?: DebugLevel) {
        level = level ?? DebugLevel.INFO;
        return function(
            prototype: T,
            key: string,
            descriptor: TypedPropertyDescriptor<Method>
        ): TypedPropertyDescriptor<Method> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: T, ...args: any[]) {
                    if (level < DebugService.level) {
                        const result = handler.call(this, ...args);
                        return result
                    }
                    const name = this.constructor.name;
                    console.group(origin ?? `${name} ${key}`)
                    DebugService.indent++;
                    
                    const result = handler.call(this, ...args);
                    if (result instanceof Promise) {
                        return result.finally(() => {
                            console.groupEnd();
                            DebugService.indent--;
                        });
                    }
                    else {
                        console.groupEnd();
                        DebugService.indent--;
                    }
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        };
    }

    public static log(origin: string, level?: DebugLevel) {
        level = level ?? DebugLevel.INFO;
        if (DebugService.isMute) return;
        if (DebugLevel.INFO < DebugService.level) return;
        const content = `${' '.repeat(DebugService.indent)}${origin}`;
        console.log(origin);
        DebugService._stack.push(content);
    }

    public static clear() {
        console.clear();
        DebugService._stack.length = 0;
    }

    public static mute() {
        DebugService.isMute = true;
        const noop = () => undefined;
        console.log = noop;
        console.dir = noop;
        console.info = noop;
        console.warn = noop;
        console.debug = noop;
        console.group = noop;
        console.groupEnd = noop;
    }

    public static unmute() {
        DebugService.isMute = false;
        console.log = DebugService.console.log;
        console.dir = DebugService.console.dir;
        console.info = DebugService.console.info;
        console.warn = DebugService.console.warn;
        console.debug = DebugService.console.debug;
        console.group = DebugService.console.group;
        console.groupEnd = DebugService.console.groupEnd;
    }

    private constructor() {}
}