import { Method } from "@/type/base";

export class Logger {
    static useDebug<T extends any[]>(
        condition?: ((target: any, ...args: T) => boolean) | boolean
    ) {
        const logger = console.log;
        return function (
            target: unknown,
            key: string,
            descriptor: TypedPropertyDescriptor<Method>
        ): TypedPropertyDescriptor<Method> {
            const handler = descriptor.value;
            descriptor.value = function(this: unknown, ...args: T) {
                const flag = 
                    typeof condition === 'function' ? 
                        condition(this, ...args) : 
                        condition;
                const tag = key[0].toUpperCase() + key.slice(1);
                const _logger = console.log;
                console.log = function(...args) {
                    if (flag) logger(tag + ":", ...args);
                };
                const result = handler?.apply(this, args);
                console.log = _logger;
                return result;
            };
            return descriptor;
        };
    }
}