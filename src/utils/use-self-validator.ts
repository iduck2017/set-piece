import { Model } from "../model";
import { Method } from "../types";

type ValidatorMap = Map<string, Array<(self: Model) => any>>;
type ValidatorRegistry = Map<Function, ValidatorMap>;

export const validatorRegistry: ValidatorRegistry = new Map();

function registerValidator(model: Model, key: string, validator: (self: any) => any) {
    const constructor = model.constructor;
    const validatorMap: ValidatorMap = validatorRegistry.get(constructor) ?? new Map();
    const validators = validatorMap.get(key) ?? [];
    validators.push(validator);
    validatorMap.set(key, validators);
    validatorRegistry.set(model.constructor, validatorMap);
}

export function useSelfValidator<
    I extends Model,
>(validator: (self: Partial<I>) => any) {
    return function(
        prototype: I,
        key: string,
        descriptor: TypedPropertyDescriptor<Method<void>>
    ) {
        registerValidator(prototype, key, validator);
        const method = descriptor.value;
        if (!method) return;
        descriptor.value = function(this: I, ...args: any[]) {
            const flag = Boolean(validator(this));
            if (!flag) return;
            return method.call(this, ...args);
        }
    }
}

function getValidators(model: Model, key: string) {
    let constructor = model.constructor;
    const result: Array<(self: Model) => any> = [];
    while (constructor) {
        const validatorMap: ValidatorMap = validatorRegistry.get(constructor) ?? new Map();
        const validators = validatorMap.get(key) ?? [];
        validators.forEach(validator => {
            result.push(validator);
        });
        constructor = Object.getPrototypeOf(constructor);
    }
    return result;
}

export function runValidators(model: Model, key: string): boolean {
    const validators = getValidators(model, key);
    for (const validator of validators) {
        const flag = Boolean(validator(model));
        if (!flag) return false;
    }
    return true;
}