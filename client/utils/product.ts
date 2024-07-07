import { FactoryService } from "../services/factory";
import type { App } from "../app";
import type { Model } from "../models/base";
import { BaseRecord } from "../types/base";
import { 
    BaseModelDict,
    BaseEvent, 
    BaseModelList, 
    BaseModel 
} from "../types/model";

export function product<N extends number>(key: N) {
    return function (target: new (config: unknown, app: App) => Model<
        N,
        BaseRecord,
        BaseRecord,
        BaseRecord,
        BaseEvent,
        BaseEvent,
        BaseModel,
        BaseModelList,
        BaseModelDict
    >) {
        FactoryService.register(key, target);
    };
}