import { Callback } from "../types";

export class CheckUtil {
    private static readonly validators = new Map<Function, Record<string, Callback[]>>();
    
    public static if<T extends Object, R = any, P extends any[] = any[]>(
        validator: Callback<any, [T, ...P]>,
        error?: string | Error,
    ) {
        return function (
            prototype: T,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback<R | undefined, P>>
        ): TypedPropertyDescriptor<Callback<R | undefined, P>> {
            const handler = descriptor.value;
            const instance = {
                [key](this: T, ...args: P) {
                    const result = validator(this, ...args);
                    if (result && handler) return handler.apply(this, args);
                    if (error instanceof Error) console.error(error);
                    if (error) console.warn(error);
                    return
                }
            }
            descriptor.value = instance[key];
            const validators = CheckUtil.validators.get(prototype.constructor) || {}
            validators[key] = validators[key] || [];
            validators[key].push(validator);
            CheckUtil.validators.set(prototype.constructor, validators);
            return descriptor;
        };
    }

    public static precheck<F extends Callback>(target: Object, method: F, ...args: Parameters<F>) {
        let validators: Callback[] = [];
        let constructor = target.constructor;
        while (constructor) {
            validators = validators.concat(CheckUtil.validators.get(constructor)?.[method.name] ?? []);
            constructor = (constructor as any).__proto__;
        }
        for (const validator of validators) {
            const result = validator(target, ...args);
            if (!result) return false;
        }
        return true;
    }
}