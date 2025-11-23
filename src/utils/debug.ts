import { Method, IClass } from "../types";

export enum DebugLevel {
    VERBOSE = 0,
    INFO,
    WARN,
    ERROR,
    FATAL,
}

export class DebugUtil {
    private static isMute: boolean = false;

    public static level: DebugLevel = DebugLevel.INFO;

    private static indent: number = 0;

    private static _stack: string[] = [];
    public static get stack(): Readonly<string[]> {
        return [...DebugUtil._stack];
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
                    if (level < DebugUtil.level) {
                        const result = handler.call(this, ...args);
                        return result
                    }
                    const name = this.constructor.name;
                    console.group(origin ?? `${name} ${key}`)
                    DebugUtil.indent++;
                    
                    const result = handler.call(this, ...args);

                    if (result instanceof Promise) {
                        return result.finally(() => {
                            console.groupEnd();
                            DebugUtil.indent--;
                        });
                    }
                    else {
                        console.groupEnd();
                        DebugUtil.indent--;
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
        if (DebugUtil.isMute) return;
        if (DebugLevel.INFO < DebugUtil.level) return;
        const content = `${' '.repeat(DebugUtil.indent)}${origin}`;
        console.log(origin);
        DebugUtil._stack.push(content);
    }

    public static clear() {
        console.clear();
        DebugUtil._stack.length = 0;
    }

    public static mute() {
        DebugUtil.isMute = true;
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
        DebugUtil.isMute = false;
        console.log = DebugUtil.console.log;
        console.dir = DebugUtil.console.dir;
        console.info = DebugUtil.console.info;
        console.warn = DebugUtil.console.warn;
        console.debug = DebugUtil.console.debug;
        console.group = DebugUtil.console.group;
        console.groupEnd = DebugUtil.console.groupEnd;
    }

    private constructor() {}
}