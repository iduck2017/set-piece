import { Model } from "../model";
import { AbstractConstructor } from "../types";
import { depCollector } from "../dep/dep-collector";
import { effectManager } from "../dep/dep-consumer-manager";
import { tagRegistry } from "../tag/tag-registry";

class EffectRegistry {
    private _config: Map<AbstractConstructor<Model>, string[]> = new Map();

    public register(
        prototype: Model,
        key: string,
        descriptor?: TypedPropertyDescriptor<() => void>,
    ) {
        const constrcutor: any = prototype.constructor;
        const keys = this._config.get(constrcutor) ?? [];
        keys.push(key);
        this._config.set(constrcutor, keys);

        if (!descriptor) return;
        const handler = descriptor.value;
        if (!handler) return;
        descriptor.value = function(this: Model) {
            const depConsumerTag = tagRegistry.query(this, key);
            depCollector.init(depConsumerTag);
            handler.call(this);
            effectManager.collect(depConsumerTag);
        }
    }

    public query(prototype: Model) {
        let constructor: any = prototype.constructor;
        const result: string[] = [];
        while (constructor) {
            const keys = this._config.get(constructor) ?? [];
            keys.forEach(key => {
                if (result.includes(key)) return;
                result.push(key);
            })
            constructor = Object.getPrototypeOf(constructor);
        }
        return result;
    }
}

export const effectRegistry = new EffectRegistry();

export function useEffect() {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<() => void>,
    ) {
        effectRegistry.register(prototype, key, descriptor);
    }
}
