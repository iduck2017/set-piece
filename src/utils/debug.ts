import { Method, IType } from "../types";

export enum LogLevel {
    DEBUG = 1,
    INFO,
    WARN,
    ERROR,
    FATAL,
}

export class DebugUtil {
    private static registry: Map<any, any> = new Map();

    public static level: LogLevel = LogLevel.WARN;

    public static log<T extends Object>(level = LogLevel.INFO) {
        return function(
            prototype: T,
            key: string,
            descriptor: TypedPropertyDescriptor<Method>
        ): TypedPropertyDescriptor<Method> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: T, ...args: any[]) {
                    const accessor = DebugUtil.registry.get(this.constructor);
                    const name = accessor?.(this) ?? this.constructor.name;
                    if (level < DebugUtil.level) {
                        const result = handler.call(this, ...args);
                        return result
                    }
                    console.group(`%c${name}::${key}`, `color: ${{
                        [LogLevel.DEBUG]: 'gray',
                        [LogLevel.INFO]: '',
                        [LogLevel.WARN]: 'orange',
                        [LogLevel.ERROR]: 'red',
                        [LogLevel.FATAL]: 'red',
                    }[level]}`)
                    const result = handler.call(this, ...args);
                    if (result instanceof Promise) return result.finally(() => console.groupEnd());
                    else console.groupEnd();
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        };
    }

    public static is<T extends Object>(accessor: (self: T) => string) {
        return function (constructor: IType<T>) {
            DebugUtil.registry.set(constructor, accessor);
        }
    }

    private constructor() {}
}