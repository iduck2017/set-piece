import { ModelId } from "../types/registry";
import { product } from "../utils/product";
import { 
    RootDict, 
    RootConfig, 
    RootRule, 
    RootState 
} from "../types/root";
import type { App } from "../app";
import { VoidData } from "../types/base";
import { BunnyModel } from "./bunny";
import { ModelConsumer } from "../utils/model-consumer";
import { Model } from "./base";
import { BaseModel } from "../types/model";

@product(ModelId.ROOT)
export class RootModel extends Model<
    ModelId.ROOT,
    VoidData,
    VoidData,
    RootRule,
    VoidData,
    RootState,
    App,
    BaseModel,
    RootDict
> {
    public consumer;

    constructor(config: RootConfig) {
        super({
            ...config,
            modelId: ModelId.ROOT,
            info: {},
            stat: {
                progress: 0,
                ...config.stat
            },
            consumer: {},
            provider: {},
            children: [
                new BunnyModel({
                    rule: {}
                })
            ],
            dict: {
                bunny: 0
            }
        });
        this.consumer = new ModelConsumer({
            raw: config.consumer || {},
            handlers: {}
        });
    }
}