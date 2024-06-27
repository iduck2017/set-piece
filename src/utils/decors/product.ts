import { FactoryService } from "../../services/factory";
import { Model } from "../../models/base";
import { IModelDefinition } from "../../types/model";

export function product<N extends number>(key: N) {
    return function (target: new (config: unknown) => Model<
        IModelDefinition<{ id: N }>
    >) {
        FactoryService.register(key, target);
    };
}