import { View } from "../view";
import { AbstractConstructor } from "../types";

type ViewRouteLoader = () => AbstractConstructor<View>
type ViewRouteLoaderMap = Map<string, ViewRouteLoader>
type ViewRouteConstructorMap = Map<string, AbstractConstructor<View>>;
class ViewRouteRegistry {
    private _config: Map<AbstractConstructor<View>, ViewRouteLoaderMap> = new Map();

    public register(
        prototype: View,
        key: string,
        loader: ViewRouteLoader
    ) {
        const type: any = prototype.constructor;
        const subConfig: ViewRouteLoaderMap = this._config.get(type) ?? new Map();
        subConfig.set(key, loader);
        this._config.set(type, subConfig);
    }

    public query(prototype: View): ViewRouteConstructorMap {
        let constructor: any = prototype.constructor;
        const result: ViewRouteConstructorMap = new Map();
        while (constructor) {
            const subConfig: ViewRouteLoaderMap = this._config.get(constructor) ?? new Map();
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

export const viewRouteRegistry = new ViewRouteRegistry();
