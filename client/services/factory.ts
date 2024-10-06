import type { App } from "../app";
import type { Model } from "../models";
import { BunnyModel } from "../models/bunny";
import { RootModel } from "../models/root";
import { TimerModel } from "../models/timer";
import { Base } from "../type";
import type { ModelConfig } from "../type/model";
import { ModelDef } from "../type/model-def";
import { ModelReg } from "../type/model-reg";
import { singleton } from "../utils/singleton";


@singleton
export class FactoryService {
    public readonly app: App;

    private _productDict: ModelReg;

    constructor(app: App) {
        this.app = app;

        this._productDict = {
            root: RootModel,
            timer: TimerModel,
            bunny: BunnyModel
        }; 
    }

    // 生成反序列化节点
    public readonly unserialize = <C extends ModelDef>(
        config: ModelConfig<C>
    ): Model<C> => {
        const Type: Base.Class = this._productDict[config.code];
        return new Type(config);
    };
}