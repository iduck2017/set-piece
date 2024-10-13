import type { App } from "../app";
import type { Model } from "../models";
import { Base } from "../configs";
import type { ModelConfig } from "../configs/model";
import { MODEL_REGISTRY } from "../configs/model-registry";
import { ModelDef } from "../configs/model-def";
import { singleton } from "../utils/singleton";


@singleton
export class FactoryService {
    public readonly app: App;

    constructor(app: App) {
        this.app = app;
    }

    // 生成反序列化节点
    public readonly unserialize = <C extends ModelDef>(
        config: ModelConfig<C>
    ): Model<C> => {
        const Type: Base.Class = MODEL_REGISTRY[config.code];
        return new Type(config);
    };
}