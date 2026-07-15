import { Event } from ".";
import { eventService } from "./event-service";
import { Model } from "../model";

type EventContext = {
    model: Model;
    event: Event;
}

/**
 * Queues normal events and flushes them at story boundaries.
 */
class EventResolver {
    private _pending = false;
    private _queue: EventContext[] = [];

    /**
     * Queue a normal event emitted during the current story.
     *
     * `Model.emit(event)` calls this for non-`PrevEvent` events instead of
     * emitting immediately.
     *
     * @param model - Producer model that emitted the event.
     * @param event - Event instance to emit when the story resolves.
     * @returns Nothing.
     */
    public register(model: Model, event: Event) {
        this._queue.push({ model, event });
    }

    /**
     * Run a story boundary and flush deferred events afterward.
     *
     * Nested story calls reuse the outer boundary so deferred events are emitted
     * once at the end of the outermost call.
     *
     * @param handler - Operation that may queue deferred events.
     * @returns The handler result.
     */
    public launch(handler: () => unknown) {
        /** Nested stories append to the outer queue. */
        if (this._pending) return handler();
        /** Run user work first, then flush queued normal events. */
        this._pending = true;
        const output = handler();
        this._pending = false;
        this.resolve();
        return output;
    }

    /**
     * Emit all deferred events and clear the queue.
     *
     * @returns Nothing.
     */
    public resolve() {
        /** Snapshot and clear first so handlers can queue future events. */
        const queue = [...this._queue];
        this._queue.length = 0;
        /** Deliver queued events synchronously in registration order. */
        queue.forEach(({ model, event }) => {
            eventService.emit(model, event);
        });
    }
}

export const eventResolver = new EventResolver();
