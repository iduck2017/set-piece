type Callback<R = any, P extends any[] = any[]> = (...args: P) => R

export class CheckService {
    private static readonly validators = new Map<Function, Record<string, Callback[]>>();
    
    public static if<T extends Object, R = any, P extends any[] = any[]>(
        validator: Callback<any, [T, ...P]>,
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

            const validators = CheckService.validators.get(target.constructor) || {}
            validators[key] = validators[key] || [];
            validators[key].push(validator);
            CheckService.validators.set(target.constructor, validators);

            return descriptor;
        };
    }

    public static precheck<F extends Callback>(target: Object, method: F, ...args: Parameters<F>) {
        let validators: Callback[] = [];
        let constructor = target.constructor;
        while (constructor) {
            validators = validators.concat(CheckService.validators.get(constructor)?.[method.name] ?? []);
            constructor = (constructor as any).__proto__;
        }
        
        for (const validator of validators) {
            const result = validator(target, ...args);
            if (!result) return false;
        }
        return true;
    }
}