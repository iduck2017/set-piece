import { Base } from "@/type/base";

export class Validator {
    private static _conditions: Map<
        Function, 
        Record<string, Base.Func[]>
    > = new Map();

    private static _setCondition(
        condition: Base.Func,
        target: any,
        key: string
    ) {
        const constructor = target.constructor;
        const conditions = Validator._conditions.get(constructor) || {};
        conditions[key] = conditions[key] || [];
        conditions[key].push(condition);
        Validator._conditions.set(constructor, conditions);
    }

    static useCondition<N extends Base.Dict, T extends any[]>(
        condition: (target: N, ...args: T) => boolean 
    ) {
        return function (
            target: N,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Func>
        ): TypedPropertyDescriptor<Base.Func> {
            Validator._setCondition(condition, target.constructor, key);
            const handler = descriptor.value;
            descriptor.value = function(this: N, ...args: T) {
                const result = condition(this, ...args);
                if (result) {
                    return handler?.apply(this, args);
                } else {
                    console.error('InvalidState:', {
                        target: this,
                        method: key
                    });
                    throw new Error();
                }
            };
            return descriptor;
        };
    }
}