import { Base } from "@/type/base";
import { Model } from "@/type/model";

export class Validator {
    private static _conditionMap: Map<
        Function, 
        Record<string, Base.Func[]>
    > = new Map();

    static preCheck<M extends Model>(
        target: M,
        key: string,
        ...args: Base.List
    ) {
        const conditions = Validator._conditionMap.get(target.constructor)?.[key] || [];
        for (const condition of conditions) {
            if (!condition(target, ...args)) return false;
        }
        return true;
    }

    private static _setCondition(
        condition: Base.Func,
        target: Record<string, any>,
        key: string
    ) {
        const constructor = target.constructor;
        const conditionList = Validator._conditionMap.get(constructor) || {};
        conditionList[key] = conditionList[key] || [];
        conditionList[key].push(condition);
        Validator._conditionMap.set(constructor, conditionList);
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
                    console.error('Invalid State', {
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