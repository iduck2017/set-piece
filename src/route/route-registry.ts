import { depRegistry } from "../dep/dep-registry";
import { Model } from "../model";
import { AbstractConstructor } from "../types";

type RouteLoader = () => AbstractConstructor<Model>
type RouteLoaderMap = Map<string, RouteLoader>
type RouteConstructorMap = Map<string, AbstractConstructor<Model>>;
class RouteRegistry {
    private _config: Map<AbstractConstructor<Model>, RouteLoaderMap> = new Map();

    /**
     * Register a routed property and mark it as dependency-backed state.
     *
     * `useRoute()` calls this during decorator evaluation. The route is later
     * recalculated by `Model.reroute()` after mount or unmount changes.
     *
     * @param prototype - Prototype that owns the route property.
     * @param key - Route property key.
     * @param loader - Function returning the ancestor model constructor.
     * @returns Nothing.
     */
    public register(
        prototype: Model,
        key: string,
        loader: RouteLoader
    ) {
        const type: any = prototype.constructor;
        const subConfig: RouteLoaderMap = this._config.get(type) ?? new Map();
        subConfig.set(key, loader);
        this._config.set(type, subConfig);
        depRegistry.register(prototype, key);
    }

    /**
     * Collect inherited route loaders and resolve them to constructors.
     *
     * @param prototype - Model instance whose constructor chain is inspected.
     * @returns Map from route property key to target model constructor.
     */
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
