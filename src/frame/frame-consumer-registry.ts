import { Frame } from ".";
import { Model } from "../model";
import { AbstractConstructor, Constructor } from "../types";

export type FrameConsumerLoader<
    I extends Model = Model,
    F extends Frame = Frame
> = (self: I) => [
    target: Array<Model | undefined> | Model | undefined,
    frame: Constructor<F>
] | undefined

class FrameConsumerRegistry {
    private _config: Map<AbstractConstructor<Model>, Map<string, Array<FrameConsumerLoader>>> = new Map();

    public register(
        prototype: Model,
        key: string,
        loader: FrameConsumerLoader<any>
    ) {
        const constructor: any = prototype.constructor;
        const subConfig = this._config.get(constructor) ?? new Map();
        const loaders = subConfig.get(key) ?? [];
        loaders.push(loader);
        subConfig.set(key, loaders);
        this._config.set(constructor, subConfig);
    }

    public query(prototype: Model) {
        const result: Map<string, Array<FrameConsumerLoader>> = new Map();
        let constructor: any = prototype.constructor;
        while (constructor) {
            const subConfig: Map<string, Array<FrameConsumerLoader>> = this._config.get(constructor) ?? new Map();
            subConfig.forEach((loaders, key) => {
                const subResult = result.get(key) ?? [];
                loaders.forEach(loader => {
                    if (subResult.includes(loader)) return;
                    subResult.push(loader);
                })
                result.set(key, subResult);
            })
            constructor = Object.getPrototypeOf(constructor);
        }
        return result;
    }
}

export const frameConsumerRegistry = new FrameConsumerRegistry();
