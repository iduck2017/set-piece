import type { App } from "../app";
import type { Model } from "../models/base";
import { Data } from "../models/node";
import { BaseData, BaseEvent } from "./base";
import type { BaseModel } from "./model";

enum EventId {
    CHECK_BEFORE,
    UPDATE_DONE,
    PING_DONE,
    PONG_DONE,
}

type CheckBeforeEvent = <
    I extends BaseData,
    S extends BaseData,
    K extends keyof (I & S)
>(data: {
    target: Data<BaseData, I, S>,
    key: K,
    prev: (I & S)[K],
    next: (I & S)[K],
}) => void

type UpdateDoneEvent = <
    I extends BaseData,
    S extends BaseData,
    K extends keyof (I & S)
>(data: {
    target: Data<BaseData, I, S>,
    key: K,
    prev: (I & S)[K],
    next: (I & S)[K]
}) => void

export {
    EventId,
    CheckBeforeEvent,
    UpdateDoneEvent
};
