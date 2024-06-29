/* eslint-disable @typescript-eslint/no-explicit-any */

import { DictModel } from "../models/dict";
import { ListModel } from "../models/list";
import { BaseConstructor } from "../types/base";
import { AppStatus } from "../types/status";
import { appStatus } from "../utils/status";
import { singleton } from "../utils/decors";
import { Service } from "./base";
import { BaseModel } from "../types/model";
import { RootModel } from "../models/root";

@singleton
export class FactoryService extends Service {
    private static readonly _products: Record<number, BaseConstructor> = {};
    
    public static register(id: number, Constructor: BaseConstructor) {
        FactoryService._products[id] = Constructor;
    }

    @appStatus(AppStatus.MOUNTING)
    public unserialize<T extends BaseModel>(config: any): T {
        const Constructor = FactoryService._products[config.modelId];
        config.app = this.app;

        if (Constructor.prototype instanceof ListModel) {
            return this._createListModel(Constructor, config);
        } 
        if (Constructor.prototype instanceof DictModel) {
            return this._createDictModel(Constructor, config);
        }

        return new Constructor(config);
    }

    public create<T extends BaseConstructor>(
        Constructor: T, 
        params: Omit<ConstructorParameters<T>[0], 'app'>
    ): InstanceType<T> {
        return new Constructor({
            ...params,
            app: this.app
        });
    }

    private _createListModel(
        Constructor: BaseConstructor, 
        config: any
    ) {
        const children: any[] = [];
        for (const childConfig of config.children) {
            children.push(this.unserialize(childConfig));
        }

        config.children = children;
        return new Constructor(config); 
    }

    private _createDictModel(Constructor: BaseConstructor, config: any) {
        const children = {} as any;
        for (const key in config.children) {
            children[key] = this.unserialize(config.children[key]);
        }

        config.children = children;
        return new Constructor(config); 
    }
}

