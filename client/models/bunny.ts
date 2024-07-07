import { BunnyConf, BunnyTmpl } from "../types/bunny";
import { GenderType } from "../types/enums";
import { ModelId } from "../types/registry";
import { product } from "../utils/product";
import { randomEnum, randomNumber } from "../utils/random";
import { Model } from "./base";

@product(ModelId.BUNNY)
export class BunnyModel extends Model<BunnyTmpl> {
    constructor(config: BunnyConf) {
        super({
            referId: config.referId,
            modelId: ModelId.BUNNY,
            list: config.list || [],
            dict: {},
            rule: {},
            info: {},
            stat: {
                age: 0,
                weight: randomNumber(50, 100),
                gender: randomEnum(GenderType.FEMALE, GenderType.MALE),
                ...config.stat
            },
            provider: config.provider || {},
            consumer: config.consumer || {},
            handlers: {}
        });
        this.debugger.eat = this.eat.bind(this);
    }

    public eat() {
        console.log('eat');
        this.data._stat.weight += randomNumber(1, 5);
    }
}