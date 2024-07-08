import { FactoryService } from "../services/factory";
import type { App } from "../app";
import { Model } from "../models/base";
import { BaseTmpl } from "../types/model";
import { UnionOf } from "../types/base";

export function product<N extends number>(key: N) {
    return function (target: new (config: unknown, app: App) => 
        Model<UnionOf<{ [0]: N }, BaseTmpl>>
    ) {
        FactoryService.register(key, target);
    };
}