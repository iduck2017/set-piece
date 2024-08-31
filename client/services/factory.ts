import type { App } from "../app";
import { Model } from "../models";
import { BunnyModel } from "../models/bunny";
import { RootModel } from "../models/root";
import { TimeModel } from "../models/time";
import { IBase } from "../type";
import { ModelCode } from "../type/definition";
import { IModel } from "../type/model";

type ProductDict = {
    bunny: typeof BunnyModel;
    root: typeof RootModel;
    time: typeof TimeModel;
}

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

    public $unserialize<M extends Model>(
        config: IModel.ReflectConfig<M>,
        parent: Model
    ): M {
        const Constructor = FactoryService.$productDict[config.code as ModelCode];
        return new Constructor(config, parent, this.app);
    }

    public unserialize<M extends ModelCode>(
        config: ConstructorParameters<ProductDict[M]>[0] & { code: M },
        parent: ConstructorParameters<ProductDict[M]>[1]
    ): InstanceType<ProductDict[M]> {
        const Constructor = FactoryService.$productDict[config.code];
        // const code = undefined as any as ModelCode.Bunny | ModelCode.Time;
        // const a = this.unserialize({
        //     code: code
        // }, undefined as any);
        return new Constructor(config, parent, this.app);
    }
}