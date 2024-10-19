import { Model } from "../models";
import { FactoryService } from "../services/factory";
import { PureModelConfig } from "../types/model";
import { ModelDef } from "../types/model-def";

export function useProduct<M extends ModelDef>(key: ModelDef.Code<M>) {
    return function (
        target: new (config: PureModelConfig<M>) => Model<M>
    ) {
        FactoryService.register(key, target);
    };
}