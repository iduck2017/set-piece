import { Model } from "../model";
import { AbstractConstructor } from "../types";
import { depCollector } from "../dep/dep-collector";
import { effectManager } from "../dep/dep-consumer-manager";
import { tagRegistry } from "../tag/tag-registry";

class EffectRegistry {
    private _config: Map<AbstractConstructor<Model>, string[]> = new Map();

    /**
     * Register an effect method and wrap it with dependency collection.
     *
     * Effects run during model initialization and during action flushes after
     * dependencies they previously read change.
     *
     * @param prototype - Prototype that owns the effect method.
     * @param key - Effect method key.
     * @param descriptor - Method descriptor supplied by TypeScript.
     * @returns Nothing.
     */
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

    /**
     * Collect inherited effect method keys for a model.
     *
     * @param prototype - Model instance whose constructor chain is inspected.
     * @returns Effect method keys registered on the model hierarchy.
     */
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
