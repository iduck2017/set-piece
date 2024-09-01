import type { App } from "../app";
import { BunnyModel } from "../models/bunny";
import { ForagerModel } from "../models/forager";
import { RootModel } from "../models/root";
import { TimeModel } from "../models/time";
import { IModelDef } from "../type/definition";
import { ModelDecl } from "../type/model";
import { ModelKey, ModelReg } from "../type/registry";

export class FactoryService {
    public readonly app: App;

    constructor(app: App) {
        this.app = app;
    }

    private static $productDict: ModelReg = {
        bunny: BunnyModel,
        root: RootModel,
        time: TimeModel,
        forager: ForagerModel
    }; 

    public unserialize<M extends IModelDef.Base>(
        config: ModelDecl.RawConfig<M>,
        parent: M[ModelKey.Parent]
    ): InstanceType<ModelReg[M[ModelKey.Code]]> {
        const Constructor = FactoryService.$productDict[config.code] as any;
        return new Constructor(config, parent, this.app);
    }
}