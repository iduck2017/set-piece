import type { App } from "../app";
import type { Model } from "../models";
import { Base } from "../types";
import type { ModelConfig } from "../types/model";
import { ModelDef } from "../types/model-def";
import { singleton } from "../utils/singleton";


@singleton
export class FactoryService {
    public readonly app: App;

    constructor(app: App) {
        this.app = app;
    }

    // 生成反序列化节点
    public readonly unserialize = <D extends ModelDef>(
        config: ModelConfig<D>
    ): Model<D> => {
        // const Type: Base.Class = MODEL_REGISTRY[config.code];
        return new Type(config);
    };
}