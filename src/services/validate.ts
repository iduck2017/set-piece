export class ValidateService {

    private static _validators: Map<Function, Record<string, Array<(...args: any[]) => any>>> = new Map();

    /**
     * Check if method is executable
     * @param target - target
     * @param key - key
     * @param args - arguments
     * @returns 
     */
    static precheck<F extends (...args: any[]) => any>(
        target: any,
        key: string,
        ...args: Parameters<F>
    ) {
        const validators: ((...args: any[]) => any)[] = [];
        let constructor: any = target.constructor;
        while (constructor.__proto__ !== null) {
            const curValidators = ValidateService._validators.get(constructor)?.[key];
            constructor = constructor.__proto__;
            if (!curValidators) continue;
            validators.push(...curValidators);
        }
        for (const validator of validators) {
            const result = validator(target, ...args);
            if (!result) return false;
        }
        return true;
    }

    /**
     * Register precheck
     * @param validator - precheck function
     * @param error - error message or error thrown
     * @returns 
     */
    static useCheck< 
        N extends Object, 
        R = any,
        P extends any[] = any[],
    >(
        validator: (target: N, ...args: P) => any,
        error?: string | Error,
    ) {
        return function (
            target: N,
            key: string,
            descriptor: TypedPropertyDescriptor<(...args: P) => R | undefined>
        ): TypedPropertyDescriptor<(...args: P) => R | undefined> {
            const constructor = target.constructor;
            const validators = ValidateService._validators.get(constructor) || {};
            validators[key] = validators[key] || [];
            validators[key].push(validator);
            ValidateService._validators.set(constructor, validators);

            let handler = descriptor.value;
            descriptor.value = function(this: N, ...args: P) {
                const result = validator(this, ...args);
                if (result && handler) return handler.apply(this, args);
                if (error instanceof Error) throw error;
                if (error) console.warn(error);
                return
            }
            Reflect.set(descriptor.value, 'key', key);
            return descriptor;
        };
    }

    private constructor() {}
}