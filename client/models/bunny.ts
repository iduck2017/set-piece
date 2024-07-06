import { VoidData } from "../types/base";
import { BunnyList, BunnyConfig, BunnyState } from "../types/bunny";
import { GenderType } from "../types/enums";
import { BaseModel } from "../types/model";
import { ModelId } from "../types/registry";
import { ModelConsumer } from "../utils/model-consumer";
import { product } from "../utils/product";
import { randomEnum, randomNumber } from "../utils/random";
import { Model } from "./base";

@product(ModelId.BUNNY)
export class BunnyModel extends Model<
    ModelId.BUNNY,
    VoidData,
    VoidData,
    VoidData,
    VoidData,
    BunnyState,
    BaseModel,
    BunnyList,
    VoidData
> {
    public consumer;

    constructor(config: BunnyConfig) {
        super({
            ...config,
            modelId: ModelId.BUNNY,
            rule: {},
            info: {},
            stat: {
                age: 0,
                weight: randomNumber(50, 100),
                gender: randomEnum(GenderType.FEMALE, GenderType.MALE),
                ...config.stat
            },
            provider: {},
            consumer: {},
            list: config.list || [], 
            dict: {}
        });

        this.consumer = new ModelConsumer({
            raw: config.consumer || {},
            handlers: {}
        });
        this.debugger.eat = this.eat.bind(this);
    }

    public eat() {
        console.log('eat');
        this.data._stat.weight += randomNumber(1, 5);
    }
}