import type { App } from "../app";
import { Model } from "../models";
import { BunnyModel } from "../models/bunny";
import { RootModel } from "../models/root";
import { TimeModel } from "../models/time";
import { IBase } from "../type";
import { ModelCode } from "../type/definition";
import { IModel } from "../type/model";

export class FactoryService {
    public readonly app: App;

    constructor(app: App) {
        this.app = app;
    }

    private static $productDict: Record<ModelCode, IBase.Class> = {
        bunny: BunnyModel,
        root: RootModel,
        time: TimeModel
    }; 

    public unserialize<M extends Model>(
        config: IModel.ReflectConfig<M>,
        parent: IModel.ReflectParent<M>
    ): M {
        const Constructor = FactoryService.$productDict[config.code];
        return new Constructor(config, parent, this.app);
    }
}