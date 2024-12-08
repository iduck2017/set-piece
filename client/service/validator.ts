import { NodeModel } from "@/model/node";
import { Base } from "@/type/base";

export class Validator {
    private static _conditions: Map<
        Function, 
        Record<string, Base.Func[]>
    > = new Map();

    static preCheck<M extends NodeModel>(
        target: M,
        key: string,
        ...args: any[]
    ) {
        const conditions = Validator._conditions.get(target.constructor)?.[key] || [];
        console.log(conditions);
        for (const condition of conditions) {
            if (!condition(target, ...args)) return false;
        }
        console.log(target.constructor, key, true);
        return true;
    }

    private static _setCondition(
        condition: Base.Func,
        target: Record<string, any>,
        key: string
    ) {
        const constructor = target.constructor;
        const conditions = Validator._conditions.get(constructor) || {};
        conditions[key] = conditions[key] || [];
        conditions[key].push(condition);
        console.log(conditions);
        Validator._conditions.set(constructor, conditions);
    }

    static useCondition<N extends Record<string, any>, T extends any[]>(
        condition: (target: N, ...args: T) => boolean 
    ) {
        return function (
            target: N,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Func>
        ): TypedPropertyDescriptor<Base.Func> {
            Validator._setCondition(condition, target, key);
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