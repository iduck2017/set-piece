import { modelEmitters, modelHandlers } from "../configs/refer";
import { PartialOf, VoidData } from "../types/base";
import { PureDictConfig } from "../types/dict";
import { EventId, EventRegistry } from "../types/events";
import { PureListConfig } from "../types/list";
import { BaseModel, ModelEvent } from "../types/model";
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
    protected handle: PartialOf<EventRegistry, ModelEvent> = {
        [EventId.CHECK_BEFORE]: this._handleCheckBefore,
        [EventId.UPDATE_DONE]: this._handleUpdateDone,    
    }

    constructor(config: PureListConfig<C>) {
        super({
            ...config,
            modelId: ModelId.LIST,
            rule: {},
            info: {},
            state: {},
            emitters: modelEmitters(),
            handlers: modelHandlers(),
            children: config.children
        });
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
    protected handle: PartialOf<EventRegistry, ModelEvent> = {
        [EventId.CHECK_BEFORE]: this._handleCheckBefore,
        [EventId.UPDATE_DONE]: this._handleUpdateDone,    
    }

    constructor(config: PureDictConfig<C>) {
        super({
            ...config,
            modelId: ModelId.DICT,
            rule: {},
            info: {},
            state: {},
            emitters: modelEmitters(),
            handlers: modelHandlers(),
            children: config.children
        });
    }
}