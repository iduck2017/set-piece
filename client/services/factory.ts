import type { App } from "../app";
import { BunnyModel } from "../models/bunny";
import { ForagerModel } from "../models/forager";
import { RootModel } from "../models/root";
import { TimerModel } from "../models/time";
import { IModel } from "../type/model";
import { ModelReg } from "../type/registry";

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

    public unserialize<M extends IModel.Define>(
        config: IModel.Config<M>
    ): InstanceType<ModelReg[IModel.Code<M>]> {
        const Constructor = FactoryService.$productDict[config.code] as any;
        return new Constructor(config, this.app);
    }
}