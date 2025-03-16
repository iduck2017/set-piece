type Callback<R = any, P extends any[] = any[]> = (...args: P) => R

export enum LogLevel {
    INFO = 0,
    WARN = 1,
    ERROR = 2,
}

export class DebugService {
    
    private static readonly stack: string[] = []
    static useStack(level?: LogLevel) {
        return function(
            target: Object,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: Object, ...args: any[]) {
                    DebugService.console(this, key, level);
                    DebugService.stack.push(key);
                    const result = handler.call(this, ...args);
                    DebugService.stack.pop();
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
    
    private static console(
        target: any, 
        key: string, 
        level?: LogLevel
    ) {
        const indent = new Array(DebugService.stack.length).fill('  ').join('')
        const namespace = target.constructor.name + '::' + key
        let constructor = target.constructor
        while (constructor) {
            const result = DebugService.levels.get(constructor);
            if (result) level = result;
            if (result) break;
            constructor = Reflect.get(constructor, '__proto__');
        }
        if (level === LogLevel.ERROR) console.error(indent, namespace)
        else if (level === LogLevel.WARN) console.warn(indent, namespace)
        else console.log(indent, namespace)
    }

    private constructor() {}
}