type Callback<R = any, P extends any[] = any[]> = (...args: P) => R

export enum LogLevel {
    INFO = 0,
    WARN = 1,
    ERROR = 2,
}

export class DebugService {
    private static readonly stack: string[] = []
    private static readonly alias: Map<Function, (target: any) => string> = new Map();

    public static log() {
        return function(
            target: Object,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: Object, ...args: any[]) {
                    const accessor = DebugService.alias.get(this.constructor)
                    const name = accessor ? accessor(this) : this.constructor.name
                    const namespace = name + '::' + key

                    console.group(namespace)
                    
                    DebugService.stack.push(namespace);
                    const result = handler.call(this, ...args);
                    DebugService.stack.pop();
                    
                    console.groupEnd()
                    
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        };
    }

    public static mute() {
        return function(
            target: Object,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: Object, ...args: any[]) {
                    const consoleOrigin = console;
                    console = new Proxy({} as any, {
                        get() { return () => undefined }
                    })
                    const result = handler.call(this, ...args);
                    console = consoleOrigin;
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        };
    }


    public static is<T>(accessor: (target: T) => string) {
        return function (constructor: new (...args: any[]) => T) {
            DebugService.alias.set(constructor, accessor);
        }
    }

    private constructor() {}
}