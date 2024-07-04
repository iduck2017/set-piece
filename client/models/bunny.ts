import type { App } from "../app";
import { VoidData } from "../types/base";
import { BunnyChildren, BunnyConfig, BunnyState } from "../types/bunny";
import { GenderType } from "../types/enums";
import { BaseModel } from "../types/model";
import { ModelId } from "../types/registry";
import { product } from "../utils/product";
import { randomEnum, randomNumber } from "../utils/random";
import { ListModel } from "./list";
import { Consumer } from "./node";

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
    public consumer = new Consumer({}, this); 
    public debuggers = {
        eat: this.eat.bind(this)
    };

    constructor(
        config: BunnyConfig,
        app: App
    ) {
        super({
            ...config,
            modelId: ModelId.BUNNY,
            rule: {},
            info: {},
            state: {
                age: 0,
                weight: randomNumber(50, 100),
                gender: randomEnum(GenderType.FEMALE, GenderType.MALE),
                ...config.state
            },
            provider: {},
            consumer: {},
            children: config.children || []
        }, app);
    }

    
    public eat() {
        console.log('eat');
        this._state.weight += randomNumber(1, 5);
    }
}