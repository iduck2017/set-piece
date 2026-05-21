import { ChangeFrame } from ".";
import { Model } from "../model";
import { AbstractConstructor, Constructor } from "../types";

export type FrameProducerLoader<T = any> = () => Constructor<ChangeFrame<T>, [{ next: T }]>;

class FrameProducerRegistry {
    private _config: Map<AbstractConstructor<Model>, Map<string, FrameProducerLoader>> = new Map();

    public register(
        prototype: Model,
        key: string,
        loader: FrameProducerLoader,
    ) {
        const constructor: any = prototype.constructor;
        const subConfig = this._config.get(constructor) ?? new Map<string, FrameProducerLoader>();
        subConfig.set(key, loader);
        this._config.set(constructor, subConfig);
    }

    public query(target: Model, key: string): FrameProducerLoader | undefined {
        let constructor: any = target.constructor;
        while (constructor) {
            const subConfig = this._config.get(constructor);
            const loader = subConfig?.get(key);
            if (loader) return loader;
            constructor = Object.getPrototypeOf(constructor);
        }
        return undefined;
    }
}

export const frameProducerRegistry = new FrameProducerRegistry();
