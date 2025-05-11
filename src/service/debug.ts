import { Agent } from "@/agent";
import { Callback } from "@/types";
import { ModelCycle } from "@/utils/cycle";

export enum LogLevel {
    INFO = 0,
    WARN = 1,
    ERROR = 2,
}

export class DebugService {
    private static readonly stack: string[] = []

    public static disable() {
        console.info = () => undefined;
        console.log = () => undefined;
        console.group = () => undefined;
        console.groupEnd = () => undefined;
        console.warn = () => undefined;
        console.error = () => undefined;
    }

    public static log(options?: {
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
                    const namespace = this.constructor.name + '::' + key
                    console.group(namespace)
                    DebugService.stack.push(namespace);
                    const result = handler.call(this, ...args);
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

    private constructor() {}
}