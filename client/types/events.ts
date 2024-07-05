import { Data } from "../utils/data";
import { BaseData } from "./base";

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
