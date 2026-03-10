import { Model } from "../model";
import { findRoute } from "../route/use-route";
import { registerDomain } from "../route/domain";
import { AbstractConstructor, Constructor } from "../types";
import { Decor } from "./decor";

type DecorSelector<D extends Decor = Decor, T extends Model = Model> = () => [
    decorType: Constructor<D, [origin: any]>, 
    domainType: Constructor<Model>,
    targetType: AbstractConstructor<T>
];

/** model constructor -> method name -> decor selectors */
type DecorSelectorsMap = Map<string, Array<DecorSelector>>;
type ModifierRegistry = Map<Function, DecorSelectorsMap>;

export const modifierRegistry: ModifierRegistry = new Map();

export function useModifier<
    I extends Model & Record<string, any>,
    T extends Model,
    D extends Decor
>(selector: DecorSelector<D, T>) {
    return function (
        prototype: I,
        key: string,
        descriptor: TypedPropertyDescriptor<(target: T, decor: D) => void>
    ) {
        registerDomain(prototype, () => selector()[1]);
        const constructor = prototype.constructor;
        const selectorsMap: DecorSelectorsMap = modifierRegistry.get(constructor) ?? new Map();
        const selectors = selectorsMap.get(key) ?? [];
        selectors.push(selector);
        selectorsMap.set(key, selectors);
        modifierRegistry.set(constructor, selectorsMap);

        const method = descriptor.value;
        if (!method) return descriptor;
        descriptor.value = function _handleDecor(this: I, target: T, decor: D) {
            const targetType = selector()[2];
            if (!(target instanceof targetType)) return;
            method.call(this, target, decor);
        }
    }
}


export function getDecorSelectorsMap(model: Model): DecorSelectorsMap {
    let constructor = model.constructor;
    const result: DecorSelectorsMap = new Map();
    while (constructor) {
        const selectorMap: DecorSelectorsMap = modifierRegistry.get(constructor) ?? new Map();
        selectorMap.forEach((selectors, key) => {
            selectors.forEach(selector => {
                const selectors = result.get(key) ?? [];
                selectors.push(selector);
                result.set(key, selectors);
            });
        });
        constructor = Object.getPrototypeOf(constructor);
    }
    return result;
}
