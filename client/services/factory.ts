import type { App } from "../app";
import type { Model } from "../models";
import { Base } from "../type";
import type { ModelConfig } from "../type/model";
import { MODEL_REG } from "../type/model-reg";
import { ModelDef } from "../type/model-def";
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
        const Type: Base.Class = MODEL_REG[config.code];
        return new Type(config);
    };
}