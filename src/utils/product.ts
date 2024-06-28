import { FactoryService } from "../services/factory";
import type { App } from "../app";
import type { Model } from "../models/base";
import { BaseData } from "../types/base";
import { BaseRefer } from "../types/common";
import { BaseModel } from "../types/model";

export function product<N extends number>(key: N) {
    return function (target: new (config: unknown) => Model<
        N,
        BaseData,
        BaseData,
        BaseData,
        BaseRefer,
        BaseRefer,
        BaseModel | App
    >) {
        FactoryService.register(key, target);
    };
}