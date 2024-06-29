import { modelRefer } from "../configs/refer";
import { VoidData } from "../types/base";
import { ModelRefer } from "../types/common";
import { PureDictConfig } from "../types/dict";
import { PureListConfig } from "../types/list";
import { BaseModel } from "../types/model";
import { ModelId } from "../types/registry";
import { DictModel } from "./dict";
import { ListModel } from "./list";

export class PureListModel<
    C extends BaseModel
> extends ListModel<
    ModelId.LIST,
    VoidData,
    VoidData,
    VoidData,
    ModelRefer,
    ModelRefer,
    BaseModel,
    C
> {
    constructor(config: PureListConfig<C>) {
        super({
            ...config,
            modelId: ModelId.LIST,
            rule: {},
            info: {},
            state: {},
            emitters: modelRefer(),
            handlers: modelRefer(),
            children: config.children
        });

    }
}

export class PureDictModel<
    C extends Record<string, BaseModel>
> extends DictModel<
    ModelId.DICT,
    VoidData,
    VoidData,
    VoidData,
    ModelRefer,
    ModelRefer,
    BaseModel,
    C
> {
    constructor(config: PureDictConfig<C>) {
        super({
            ...config,
            modelId: ModelId.DICT,
            rule: {},
            info: {},
            state: {},
            emitters: modelRefer(),
            handlers: modelRefer(),
            children: config.children
        });

    }
}