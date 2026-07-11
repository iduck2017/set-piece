import { DiffFrame } from ".";
import { Model } from "../model";
import { AbstractConstructor, Constructor } from "../types";

export type FrameProducerLoader<T = any> = () => Constructor<DiffFrame<T>, [{ next: T }]>;

class FrameProducerRegistry {
    private _loaders: Map<AbstractConstructor<Model>, Map<string, FrameProducerLoader>> = new Map();

    /**
     * Register the frame constructor loader for a producer property.
     *
     * `useFrameProducer()` calls this during decorator evaluation. Later,
     * `frameProducerResolver` uses it to build diff frames after the property
     * changes.
     *
     * @param prototype - Prototype that owns the producer property.
     * @param key - Producer property key.
     * @param loader - Function returning the frame constructor to emit.
     * @returns Nothing.
     */
    public register(
        prototype: Model,
        key: string,
        loader: FrameProducerLoader,
    ) {
        const ctor: any = prototype.constructor;
        const loaders = this._loaders.get(ctor) ?? new Map<string, FrameProducerLoader>();
        loaders.set(key, loader);
        this._loaders.set(ctor, loaders);
    }

    /**
     * Find the nearest inherited frame producer loader for a property.
     *
     * @param target - Model instance whose constructor chain is searched.
     * @param key - Producer property key.
     * @returns The registered loader, or undefined when the property is not a
     * frame producer.
     */
    public query(target: Model, key: string): FrameProducerLoader | undefined {
        let ctor: any = target.constructor;
        while (ctor) {
            const loaders = this._loaders.get(ctor);
            const loader = loaders?.get(key);
            if (loader) return loader;
            ctor = Object.getPrototypeOf(ctor);
        }
        return undefined;
    }
}

export const frameProducerRegistry = new FrameProducerRegistry();
