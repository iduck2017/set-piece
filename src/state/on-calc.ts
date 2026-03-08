import { Model } from "../model";
import { findRoute } from "../route/as-route";
import { registerDomain } from "../route/domain";
import { AbstractConstructor, Constructor } from "../types";
import { Decor } from "./decor";

type DecorSelector<D extends Decor = Decor> = () => [Constructor<D, [origin: any]>, Constructor<Model>];

/** model constructor -> method name -> event selectors */
type DecorSelectorsMap = Map<string, Array<DecorSelector>>;

type DecorSelectorsRegistry = Map<Function, DecorSelectorsMap>;

export const decorRegistry: DecorSelectorsRegistry = new Map();


export function onCalc<
    I extends Model & Record<string, any>,
    D extends Decor
>(selector: DecorSelector<D>) {
    return function (
        prototype: I,
        key: string,
        descriptor: TypedPropertyDescriptor<(target: Model, decor: D) => void>
    ) {
        registerDomain(prototype, () => selector()[1]);
        const constructor = prototype.constructor;
        const selectorsMap: DecorSelectorsMap = decorRegistry.get(constructor) ?? new Map();
        const selectors = selectorsMap.get(key) ?? [];
        selectors.push(selector);
        selectorsMap.set(key, selectors);
        decorRegistry.set(constructor, selectorsMap);
    }
}


export function getDecorSelectorsMap(model: Model): DecorSelectorsMap {
    let constructor = model.constructor;
    const result: DecorSelectorsMap = new Map();
    while (constructor) {
        const selectorMap: DecorSelectorsMap = decorRegistry.get(constructor) ?? new Map();
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
