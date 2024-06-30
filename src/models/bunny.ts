import type { App } from "../app";
import { modelEmitters, modelHandlers } from "../configs/refer";
import { PartialOf, VoidData } from "../types/base";
import { BunnyChildren, BunnyConfig, BunnyState } from "../types/bunny";
import { GenderType } from "../types/enums";
import { EventId, EventRegistry } from "../types/events";
import { BaseModel, ModelEvent } from "../types/model";
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
    constructor(
        config: BunnyConfig,
        app: App,
    ) {
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
            emitters: modelEmitters(),
            handlers: modelHandlers(),
            children: config.children || []
        }, app);
    }

    protected handle: PartialOf<EventRegistry, ModelEvent> = {
        [EventId.CHECK_BEFORE]: this._handleCheckBefore,
        [EventId.UPDATE_DONE]: this._handleUpdateDone
    }
}