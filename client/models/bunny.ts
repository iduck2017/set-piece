import type { App } from "../app";
import { VoidData } from "../types/base";
import { BunnyChildren, BunnyConfig, BunnyState } from "../types/bunny";
import { GenderType } from "../types/enums";
import { EventId } from "../types/events";
import { BaseModel } from "../types/model";
import { ModelId } from "../types/registry";
import { product } from "../utils/product";
import { randomEnum, randomNumber } from "../utils/random";
import { ListModel } from "./list";

@product(ModelId.BUNNY)
export class BunnyModel extends ListModel<
    ModelId.BUNNY,
    never,
    never,
    VoidData,
    VoidData,
    BunnyState,
    BaseModel,
    BunnyChildren
> {
    protected _handle = {
        [EventId.CHECK_BEFORE]: this._handleCheckBefore,
        [EventId.UPDATE_DONE]: this._handleUpdateDone
    };

    public debug = {
        eat: () => this.eat()
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
            emitters: {},
            handlers: {},
            children: config.children || []
        }, app);
    }

    
    public eat() {
        // this._state.weight += randomNumber(1, 5);
    }
}