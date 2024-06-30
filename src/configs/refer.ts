import { EventId } from "../types/events";
import { ModelEvent } from "../types/model";

function modelHandlers(): Record<ModelEvent, string[]> {
    return {
        [EventId.CHECK_BEFORE]: [],
        [EventId.UPDATE_DONE]: []
    };
}


export {
    modelHandlers as modelEmitters,
    modelHandlers
};