import type { App } from "../app";
import type { Model } from "../models/base";
import { BaseData, BaseEvent } from "./base";
import type { BaseModel } from "./model";

enum EventId {
    CHECK_BEFORE,
    UPDATE_DONE,
    PING_DONE,
    PONG_DONE,
}

type CheckBeforeEvent = <
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    K extends keyof (R & I & S)
>(data: {
    target: Model<
        number,
        BaseEvent,
        BaseEvent,
        R,
        I,
        S,
        BaseModel | App
    >,
    key: K,
    prev: (R & I & S)[K],
    next: (R & I & S)[K],
}) => void

type UpdateDoneEvent = <
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    K extends keyof (R & I & S)
>(data: {
    target: Model<
        number,
        BaseEvent,
        BaseEvent,
        R,
        I,
        S,
        BaseModel | App
    >,
    key: K,
    prev: (R & I & S)[K],
    next: (R & I & S)[K]
}) => void

export {
    EventId,
    CheckBeforeEvent,
    UpdateDoneEvent
};
