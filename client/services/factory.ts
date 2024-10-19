import type { App } from "../app";
import type { Model } from "../models";
import { Base } from "../types";
import type { ModelConfig, PureModelConfig } from "../types/model";
import { ModelDef } from "../types/model-def";
import { singleton } from "../utils/singleton";


@singleton
export class FactoryService {
    public readonly app: App;

    private static readonly _productDict: Record<
        string,
        new (config: PureModelConfig<any>) => Model
    >;
    public static readonly register = (
        code: string,
        target: new (config: PureModelConfig<any>) => Model
    ) => {
        if (FactoryService._productDict[code] !== target) throw new Error();
        FactoryService._productDict[code] = target;
    };

    constructor(app: App) {
        this.app = app;
    }

    // 生成反序列化节点
    public readonly unserialize = <D extends ModelDef>(
        config: ModelConfig<D>
    ): Model<D> => {
        const Type: Base.Class = FactoryService._productDict[config.code];
        return new Type(config);
    };
}