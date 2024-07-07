import { FactoryService } from "../services/factory";
import type { App } from "../app";
import type { Model } from "../models/base";
import { ModelTmpl } from "../types/model";

export function product<N extends number>(key: N) {
    return function (target: new (config: unknown, app: App) => 
        Model<ModelTmpl<{ [0]: N }>>
    ) {
        FactoryService.register(key, target);
    };
}