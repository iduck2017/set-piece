import type { App } from "../app";
import type { Model } from "../model";
import { Base } from "../type";
import type { TmplModelConfig, BaseModelConfig } from "../type/model/config";
import { ModelDef } from "../type/model/define";
import { useSingleton } from "../utils/decor/singleton";

@useSingleton
export class FactoryService {
    public readonly app: App;

    private static readonly _productDict: Record<
        string,
        new (config: BaseModelConfig<any>) => Model
    > = {};

    public static register<M extends ModelDef>(
        code: string,
        target: new (config: BaseModelConfig<M>) => Model<M>
    ) {
        if (FactoryService._productDict[code]) throw new Error();
        FactoryService._productDict[code] = target;
    }

    constructor(app: App) {
        this.app = app;
    }

    // 生成反序列化节点
    public unserialize<D extends ModelDef>(
        config: TmplModelConfig<D>
    ): Model<D> {
        const Type: Base.Class = FactoryService._productDict[config.code];
        if (!Type) throw new Error(`未注册的模型类型：${config.code}`);
        return new Type(config);
    }
}