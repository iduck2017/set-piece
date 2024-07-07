import { ModelId } from "../types/registry";
import { product } from "../utils/product";
import { 
    RootDict, 
    RootConfig, 
    RootRule, 
    RootStat
} from "../types/root";
import { VoidData } from "../types/base";
import { BunnyModel } from "./bunny";
import { Model } from "./base";
import { BaseModelList } from "../types/model";

@product(ModelId.ROOT)
export class RootModel extends Model<
    ModelId.ROOT,
    RootRule,
    VoidData,
    RootStat,
    VoidData,
    VoidData,
    RootModel,
    BaseModelList,
    RootDict
> {
    constructor(config: RootConfig) {
        super({
            referId: config.referId,
            modelId: ModelId.ROOT,
            rule: config.rule,
            info: {},
            stat: {
                progress: 0,
                ...config.stat
            },
            provider: config.provider || {},
            consumer: config.consumer || {},
            list: [],
            dict: {
                bunny: config.dict?.bunny || new BunnyModel({ rule: {} })
            },
            handlers: {}
        });
    }
}