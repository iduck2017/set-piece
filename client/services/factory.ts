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

    public unserialize<M extends Model>(
        config: IModel.ReflectConfig<M>,
        parent: any
    ): M {
        const Constructor = FactoryService.$productDict[config.code as ModelCode];
        return new Constructor(config, parent, this.app);
    }

    public unserialize2<X extends ModelCode>(
        code: X,
        config: ConstructorParameters<ProductDict[X]>[0],
        parent: ConstructorParameters<ProductDict[X]>[1]
    ): InstanceType<ProductDict[X]> {
        const Constructor = FactoryService.$productDict[code];
        return new Constructor(config, parent, this.app);
    }
}