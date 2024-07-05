import { VoidData } from "../types/base";
import { BunnyChildren, BunnyConfig, BunnyState } from "../types/bunny";
import { GenderType } from "../types/enums";
import { BaseModel } from "../types/model";
import { ModelId } from "../types/registry";
import { Consumer } from "../utils/consumer";
import { ModelConsumer } from "../utils/model-consumer";
import { product } from "../utils/product";
import { randomEnum, randomNumber } from "../utils/random";
import { ListModel } from "./list";

@product(ModelId.BUNNY)
export class BunnyModel extends ListModel<
    ModelId.BUNNY,
    VoidData,
    VoidData,
    VoidData,
    VoidData,
    BunnyState,
    BaseModel,
    BunnyChildren
> {
    public consumer = new ModelConsumer({}); 

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
            children: config.children || []
        });

        this.debugger.eat = this.eat.bind(this);
    }

    
    public eat() {
        console.log('eat');
        this.data._stat.weight += randomNumber(1, 5);
    }
}