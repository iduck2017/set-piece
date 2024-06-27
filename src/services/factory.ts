/* eslint-disable @typescript-eslint/no-explicit-any */

import { DictModel } from "../models/dict";
import { ListModel } from "../models/list";
import { BaseConstructor } from "../types/base";
import { AppStatus } from "../types/status";
import { appStatus } from "../utils/decors/status";
import { singleton } from "../utils/decors/singleton";
import { Service } from "./base";
import { Model } from "../models/base";

@singleton
export class FactoryService extends Service {
    private static _products = {} as Record<number, BaseConstructor>;
    public static get products() { return FactoryService._products; }
    
    public static register(id: number, Constructor: BaseConstructor) {
        FactoryService._products[id] = Constructor;
    }

    @appStatus(AppStatus.MOUNTING)
    public create<T extends Model>(config: any): T {
        const Constructor = FactoryService._products[config.productID];
        config.app = this.app;

        if (Constructor.prototype instanceof ListModel) {
            return this._createListModel(Constructor, config);
        } 
        if (Constructor.prototype instanceof DictModel) {
            return this._createDictModel(Constructor, config);
        }

        return new Constructor(config);
    }

    private _createListModel(
        Constructor: BaseConstructor, 
        config: any
    ) {
        const children: any[] = [];
        for (const childConfig of config.children) {
            children.push(this.create(childConfig));
        }

        config.children = children;
        return new Constructor(config); 
    }

    private _createDictModel(Constructor: BaseConstructor, config: any) {
        const children = {} as any;
        for (const key in config.children) {
            children[key] = this.create(config.children[key]);
        }

        config.children = children;
        return new Constructor(config); 
    }
}
