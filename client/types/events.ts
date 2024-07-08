import { Data } from "../utils/model-data";
import { BaseRecord } from "./base";

enum EventId {
    CHECK_BEFORE,
    UPDATE_DONE,
    PING_DONE,
    PONG_DONE,
}

type CheckBeforeEvent = <
    I extends BaseRecord,
    S extends BaseRecord,
    K extends keyof (I & S)
>(data: {
    target: Data<BaseRecord, I, S>,
    key: K,
    prev: (I & S)[K],
    next: (I & S)[K],
}) => void

type UpdateDoneEvent = <
    I extends BaseRecord,
    S extends BaseRecord,
    K extends keyof (I & S)
>(data: {
    target: Data<BaseRecord, I, S>,
    key: K,
    prev: (I & S)[K],
    next: (I & S)[K]
}) => void

export {
    EventId,
    CheckBeforeEvent,
    UpdateDoneEvent
};
