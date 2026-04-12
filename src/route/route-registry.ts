import { Model } from "../model";
import { AbstractConstructor } from "../types";

type RouteLoader = () => AbstractConstructor<Model>
type RouteLoaderMap = Map<string, RouteLoader>
type RouteConstructorMap = Map<string, AbstractConstructor<Model>>;
class RouteRegistry {
    private _config: Map<AbstractConstructor<Model>, RouteLoaderMap> = new Map();

    public register(
        prototype: Model, 
        key: string, 
        loader: RouteLoader
    ) {
        const type: any = prototype.constructor;
        const subConfig: RouteLoaderMap = this._config.get(type) ?? new Map();
        subConfig.set(key, loader);
        this._config.set(type, subConfig);
    }

    public query(prototype: Model): RouteConstructorMap {
        let constructor: any = prototype.constructor;
        const result: RouteConstructorMap = new Map();
        while (constructor) {
            const subConfig: RouteLoaderMap = this._config.get(constructor) ?? new Map();
            subConfig.forEach((loader, key) => {
                if (result.has(key)) return;
                const routeConstructor = loader();
                result.set(key, routeConstructor);
            });
            constructor = Object.getPrototypeOf(constructor);
        }
        return result;
    }
}

export const routeRegistry = new RouteRegistry();
