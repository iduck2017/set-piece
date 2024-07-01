import { App } from "../app";
import { VoidData } from "../types/base";
import { PureDictConfig } from "../types/dict";
import { EventId } from "../types/events";
import { PureListConfig } from "../types/list";
import { BaseModel } from "../types/model";
import { ModelId } from "../types/registry";
import { DictModel } from "./dict";
import { ListModel } from "./list";

export class PureListModel<
    C extends BaseModel
> extends ListModel<
    ModelId.LIST,
    never,
    never,
    VoidData,
    VoidData,
    VoidData,
    BaseModel,
    C
> {
    protected _handle = {
        [EventId.CHECK_BEFORE]: this._handleCheckBefore,
        [EventId.UPDATE_DONE]: this._handleUpdateDone
    };

    constructor(config: PureListConfig<C>, app: App) {
        super({
            ...config,
            modelId: ModelId.LIST,
            rule: {},
            info: {},
            state: {},
            emitters: {},
            handlers: {},
            children: config.children
        }, app);
    }

}

export class PureDictModel<
    C extends Record<string, BaseModel>
> extends DictModel<
    ModelId.DICT,
    never,
    never,
    VoidData,
    VoidData,
    VoidData,
    BaseModel,
    C
> {
    
    protected _handle = {
        [EventId.CHECK_BEFORE]: this._handleCheckBefore,
        [EventId.UPDATE_DONE]: this._handleUpdateDone
    };

    constructor(config: PureDictConfig<C>, app: App) {
        super({
            ...config,
            modelId: ModelId.DICT,
            rule: {},
            info: {},
            state: {},
            emitters: {},
            handlers: {},
            children: config.children
        }, app);
    }
}