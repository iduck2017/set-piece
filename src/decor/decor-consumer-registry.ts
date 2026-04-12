import { Decor } from ".";
import { Model } from "../model";
import { AbstractConstructor, Constructor } from "../types";

export type DecorConsumerLoader<
    I extends Model = Model,
    T extends Model = Model,
    D extends Decor = Decor
> = (i: I) => [
    target: Array<T | undefined> | T | undefined,
    decor: Constructor<D>
]

type DecorConsumerLoadersMap = Map<string, Array<DecorConsumerLoader>>
class DecorConsumerRegistry {
    private _config: Map<AbstractConstructor<Model>, DecorConsumerLoadersMap> = new Map();

    public register(
        prototype: Model,
        key: string,
        loader: DecorConsumerLoader<any>,
    ) {
        const constructor: any = prototype.constructor;
        const subConfig: DecorConsumerLoadersMap = this._config.get(constructor) ?? new Map();
        const loaders = subConfig.get(key) ?? [];
        loaders.push(loader);
        subConfig.set(key, loaders);
        this._config.set(constructor, subConfig);
    }

   public query(prototype: Model) {
        const result: DecorConsumerLoadersMap = new Map();
        let constructor: any = prototype.constructor;
        while (constructor) {
            const subConfig: DecorConsumerLoadersMap = this._config.get(constructor) ?? new Map();
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
export const decorConsumerRegistry = new DecorConsumerRegistry();
