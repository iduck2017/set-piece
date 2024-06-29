import { VoidData } from "../types/base";
import { BunnyChildren, BunnyConfig, BunnyState } from "../types/bunny";
import { ModelRefer } from "../types/common";
import { GenderType } from "../types/enums";
import { IListConfig } from "../types/list";
import { BaseModel } from "../types/model";
import { ModelId } from "../types/registry";
import { randomEnum, randomNumber } from "../utils/random";
import { ListModel } from "./list";

export class BunnyModel extends ListModel<
    ModelId.BUNNY,
    VoidData,
    VoidData,
    BunnyState,
    ModelRefer,
    ModelRefer,
    BaseModel,
    BunnyChildren
> {
    constructor(config: BunnyConfig) {
        super({
            ...config,
            modelId: ModelId.BUNNY,
            rule: {},
            info: {},
            state: {
                ...config.state,
                age: 0,
                weight: randomNumber(50, 100),
                gender: randomEnum(GenderType.FEMALE, GenderType.MALE)
            },
            emitters: {
                update
            }
        });
    }
}