import type { App } from "../app";
import type { Model } from "../models/base";
import { BaseData } from "./base";
import { BaseModel } from "./model";

type EventCallbacks = {
    onCheckBefore: <
        R extends BaseData,
        I extends BaseData,
        S extends BaseData,
        K extends keyof (R & I & S)
    >(
        target: Model<
            number,
            R,
            I,
            S,
            Record<string, BaseModel[]>,
            Record<string, BaseModel[]>,
            BaseModel | App
        >,
        key: K,
        prev: (R & I & S)[K]
    ) => (R & I & S)[K]

    onUpdateDone: <
        R extends BaseData,
        I extends BaseData,
        S extends BaseData,
        K extends keyof (R & I & S)
    >(
        target: Model<
            number,
            R,
            I,
            S,
            Record<string, BaseModel[]>,
            Record<string, BaseModel[]>,
            BaseModel | App
        >,
        key: K,
        prev: (R & I & S)[K],
        next: (R & I & S)[K]
    ) => (R & I & S)[K]
}

type EventId = keyof EventCallbacks;
type EventHandler<H extends EventId> = {
    [K in H]: EventCallbacks[K]
}


export {
    EventId,
    EventHandler,
    EventCallbacks
};
