import { FactoryService } from "../services/factory";
import type { App } from "../app";
import type { Model } from "../models/base";
import { BaseData, BaseEvent } from "../types/base";
import { BaseModel } from "../types/model";

export function product<N extends number>(key: N) {
    return function (target: new (config: unknown, app: App) => Model<
        N,
        BaseEvent,
        BaseEvent,
        BaseData,
        BaseData,
        BaseData,
        BaseModel | App
    >) {
        FactoryService.register(key, target);
    };
}