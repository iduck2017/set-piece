import { depManager } from "../dep/dep-manager";
import { Model } from "../model";
import { effectManager } from "./effect-manager";
import { effectRegistry } from "./effect-registry";
import { fieldRegistry } from "../utils/field-registry";
import { depCollector } from "../dep/dep-collector";

// @todo: Support async
export function useEffect() {
    return function(
        prototype: Model,
        key: string,
        descriptor: PropertyDescriptor
    ) {
        effectRegistry.register(prototype, key);
        const method = descriptor.value;
        if (!method) return;
        descriptor.value = function(this: Model, ...args: any[]) {
            const effectField = fieldRegistry.query(this, key);
            console.log('Run effect', this.name, key);
            depCollector.init(effectField)
            method.call(this, ...args);
            const deps = depCollector.query(effectField);
            deps.forEach(dep => {
                effectManager.bind(dep, effectField);
                depManager.bind(effectField, dep);
            })
            depCollector.clear(effectField);
        }
    }
}
