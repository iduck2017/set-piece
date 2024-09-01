import type { App } from "../app";
import { BunnyModel } from "../models/bunny";
import { ForagerModel } from "../models/forager";
import { RootModel } from "../models/root";
import { TimerModel } from "../models/time";
import { BaseModelDef } from "../type/definition";
import { ModelType } from "../type/model";
import { ModelKey, ModelReg } from "../type/registry";

export class FactoryService {
    public readonly app: App;

    constructor(app: App) {
        this.app = app;
    }

    private static $productDict: ModelReg = {
        bunny: BunnyModel,
        root: RootModel,
        time: TimerModel,
        forager: ForagerModel
    }; 

    public unserialize<M extends BaseModelDef>(
        config: ModelType.RawConfig<M>,
        parent: M[ModelKey.Parent]
    ): InstanceType<ModelReg[M[ModelKey.Code]]> {
        const Constructor = FactoryService.$productDict[config.code] as any;
        return new Constructor(config, parent, this.app);
    }
}