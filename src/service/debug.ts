import { Callback } from "../types";

export class DebugService {
    private static readonly stack: string[] = []

    public static log<T extends Object>(
        accessor?: (self: T) => string,
        color?: string
    ) {
        return function(
            prototype: T,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: T, ...args: any[]) {
                    const name = accessor?.(this) ?? this.constructor.name
                    console.group(`%c${name}::${key}`, `color: ${color}`)
                    DebugService.stack.push(name);
                    const result = handler.call(this, ...args);
                    if (result instanceof Promise) {
                        return result.finally(() => {
                            DebugService.stack.pop();
                            console.groupEnd();
                        });
                    } else {
                        DebugService.stack.pop();
                        console.groupEnd();
                        return result;
                    }
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        };
    }

    private constructor() {}
}