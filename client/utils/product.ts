import { FactoryService } from "../services/factory";
import type { App } from "../app";
import { Model } from "../models/base";
import { UnionOf } from "../types/base";
import { BaseTmpl, TmplId } from "../types/tmpl";

export function product<N extends number>(key: N) {
    return function (target: new (config: unknown, app: App) => 
        Model<
            UnionOf<
                { [TmplId.ID]: N }, 
                BaseTmpl
            >
        >
    ) {
        FactoryService.register(key, target);
    };
}