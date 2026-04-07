import { Model } from "../model";
import { AbstractConstructor } from "../types";
import { getTypes } from "../utils/get-types";

type RouteConfig = () => AbstractConstructor<Model>
type RouteConfigMap = Map<string, RouteConfig>
type RouteTypeMap = Map<string, AbstractConstructor<Model>>;
class RouteRegistry {
    private _config: Map<AbstractConstructor<Model>, RouteConfigMap> = new Map();

    public register(
        prototype: Model, 
        key: string, 
        method: RouteConfig
    ) {
        const type: any = prototype.constructor;
        const subConfig: RouteConfigMap = this._config.get(type) ?? new Map();
        subConfig.set(key, method);
        this._config.set(type, subConfig);
    }

    public query(model: Model): RouteTypeMap {
        const types = getTypes(model);
        const result: RouteTypeMap = new Map();
        types.forEach(type => {
            const subConfig: RouteConfigMap = this._config.get(type) ?? new Map();
            subConfig.forEach((fact, key) => {
                if (result.has(key)) return;
                result.set(key, fact());
            });
        });
        return result;
    }
}

export const routeRegistry = new RouteRegistry();
