import { depRegistry } from "../dep/dep-registry";
import { Model } from "../model";
import { AbstractConstructor } from "../types";

type RouteLoader = () => AbstractConstructor<Model>
type RouteLoaderMap = Map<string, RouteLoader>
type RouteConstructorMap = Map<string, AbstractConstructor<Model>>;
class RouteRegistry {
    private _loaders: Map<AbstractConstructor<Model>, RouteLoaderMap> = new Map();

    /**
     * Register a routed property and mark it as dependency-backed state.
     *
     * `useRoute()` calls this during decorator evaluation. The route is later
     * recalculated by `RouteResolver` after mount or unmount changes.
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
        const ctor: any = prototype.constructor;
        const loaders: RouteLoaderMap = this._loaders.get(ctor) ?? new Map();
        loaders.set(key, loader);
        this._loaders.set(ctor, loaders);
        depRegistry.register(prototype, key);
    }

    /**
     * Collect inherited route loaders and resolve them to constructors.
     *
     * @param prototype - Model instance whose constructor chain is inspected.
     * @returns Map from route property key to target model constructor.
     */
    public query(prototype: Model): RouteConstructorMap {
        let ctor: any = prototype.constructor;
        const routes: RouteConstructorMap = new Map();
        while (ctor) {
            const loaders: RouteLoaderMap = this._loaders.get(ctor) ?? new Map();
            loaders.forEach((loader, key) => {
                if (routes.has(key)) return;
                const RouteCtor = loader();
                routes.set(key, RouteCtor);
            });
            ctor = Object.getPrototypeOf(ctor);
        }
        return routes;
    }
}

export const routeRegistry = new RouteRegistry();
