type Callback<R = any, P extends any[] = any[]> = (...args: P) => R

export class ValidatorContext {
    private static readonly validators = new Map<Function, Record<string, Callback[]>>();
    
    static if<T extends Object, R = any, P extends any[] = any[]>(
        validator: (target: T, ...args: P) => any,
        error?: string | Error,
    ) {
        return function (
            target: T,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback<R | undefined, P>>
        ): TypedPropertyDescriptor<Callback<R | undefined, P>> {
            const handler = descriptor.value;
            const instance = {
                [key](this: T, ...args: P) {
                    const result = validator(this, ...args);
                    if (result && handler) return handler.apply(this, args);
                    if (error instanceof Error) throw error;
                    if (error) console.warn(error);
                    return
                }
            }
            descriptor.value = instance[key];
            const validators = ValidatorContext.validators.get(target.constructor) || {}
            validators[key] = validators[key] || [];
            validators[key].push(validator);
            ValidatorContext.validators.set(target.constructor, validators);
            return descriptor;
        };
    }

    static precheck<F extends Callback>(target: Object, method: F, ...args: Parameters<F>) {
        let validators: Callback[] = [];
        let constructor = target.constructor;
        while (constructor) {
            const _validators = ValidatorContext.validators.get(constructor) || {};
            validators = validators.concat(_validators[method.name] || []);
            constructor = Reflect.get(constructor, '__proto__');
        }
        for (const validator of validators) {
            const result = validator(target, ...args);
            if (!result) return false;
        }
        return true;
    }
}