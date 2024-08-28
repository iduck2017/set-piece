import type { App } from "../app";
import { Model } from "../models";
import { BunnyModel } from "../models/bunny";
import { RootModel } from "../models/root";
import { Base } from "../type";
import { ModelCode } from "../type/code";
import { ModelType } from "../type/model";

export class FactoryService {
    public readonly app: App;

    constructor(app: App) {
        this.app = app;
    }

    private static $productDict: Record<ModelCode, Base.Class> = {
        bunny: BunnyModel,
        root: RootModel
    }; 

    public unserialize<M extends Model>(
        config: ModelType.ReflectConfig<M>,
        parent: any
    ): M {
        const Constructor = FactoryService.$productDict[config.code as ModelCode];
        return new Constructor(config, parent, this.app);
    }
}