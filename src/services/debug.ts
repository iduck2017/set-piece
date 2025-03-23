type Callback<R = any, P extends any[] = any[]> = (...args: P) => R

export enum LogLevel {
    INFO = 0,
    WARN = 1,
    ERROR = 2,
}

export class DebugService {
    
    private static readonly stack: string[] = []
    static useStack(options?: {
        useArgs?: boolean,
        useResult?: boolean,
    }) {
        return function(
            target: Object,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: Object, ...args: any[]) {
                    const namespace = target.constructor.name + '::' + key
                    console.group(namespace)
                    DebugService.stack.push(namespace);
                    const result = handler.call(this, ...args);
                    const output = [...args]; 
                    if (result !== undefined) output.push(result) 
                    if (options?.useArgs) console.log('args', ...args);
                    if (options?.useResult) console.log('result', result)
                    DebugService.stack.pop();
                    console.groupEnd()
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        };
    }

    static useMute() {
        return function(
            target: Object,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: Object, ...args: any[]) {
                    const consoleLog = console.log;
                    const consoleWarn = console.warn;
                    const consoleError = console.error;
                    console.log = () => undefined;
                    console.warn = () => undefined;
                    console.error = () => undefined;
                    const result = handler.call(this, ...args);
                    console.log = consoleLog;
                    console.warn = consoleWarn;
                    console.error = consoleError;
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        };
    }


    private static readonly levels = new Map<Function, LogLevel>()
    static useLevel(level: LogLevel) {
        return function(constructor: Function) {
            DebugService.levels.set(constructor, level);
        }
    }

    private static get indent(): string {
        return new Array(DebugService.stack.length).fill(' ').join('')
    }

    private static get namespace(): string {
        return DebugService.stack[DebugService.stack.length - 1] ?? '';
    }

    // static log(...args: any) {
    //     const indent = DebugService.indent;
    //     const namespace = DebugService.namespace;
    //     console.log(indent, namespace, ...args)
    // }

    // static warn(...args: any) {
    //     const indent = DebugService.indent;
    //     const namespace = DebugService.namespace;
    //     console.warn(indent, namespace, ...args);
    // }

    // static error(...args: any) {
    //     const index = DebugService.indent;
    //     const namespace = DebugService.namespace;
    //     console.error(index, namespace, ...args);
    // }
    
    // private static console(
    //     target: any, 
    //     key: string, 
    // ) {
    //     const indent = new Array(DebugService.stack.length).fill('  ').join('')
    //     const namespace = target.constructor.name + '::' + key
    //     console.debug(indent, namespace, '{')
    //     // let constructor = target.constructor
    //     // let level: LogLevel = LogLevel.INFO;
    //     // while (constructor) {
    //     //     const result = DebugService.levels.get(constructor);
    //     //     if (result) level = result;
    //     //     if (result) break;
    //     //     constructor = Reflect.get(constructor, '__proto__');
    //     // }
    //     // if (level === LogLevel.ERROR) console.error(indent, namespace)
    //     // else if (level === LogLevel.WARN) console.warn(indent, namespace)
    //     // else console.log(indent, namespace)
    // }

    private constructor() {}
}