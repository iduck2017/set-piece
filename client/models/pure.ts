import { App } from "../app";
import { VoidData } from "../types/base";
import { PureDictConfig } from "../types/dict";
import { PureListConfig } from "../types/list";
import { BaseModel } from "../types/model";
import { ModelId } from "../types/registry";
import { DictModel } from "./dict";
import { ListModel } from "./list";
import { Consumer } from "./node";

export class PureListModel<
    C extends BaseModel
> extends ListModel<
    ModelId.LIST,
    VoidData,
    VoidData,
    VoidData,
    VoidData,
    VoidData,
    BaseModel,
    C
> {
    public consumer = new Consumer({});

    constructor(config: PureListConfig<C>) {
        super({
            ...config,
            modelId: ModelId.LIST,
            rule: {},
            info: {},
            stat: {},
            provider: {},
            consumer: {},
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
    VoidData,
    VoidData,
    BaseModel,
    C
> {
    public consumer = new Consumer({});

    constructor(config: PureDictConfig<C>) {
        super({
            ...config,
            modelId: ModelId.DICT,
            rule: {},
            info: {},
            stat: {},
            provider: {},
            consumer: {},
            children: config.children
        });
    }
}