import { Event } from ".";
import { eventService } from "./event-service";
import { Model } from "../model";

type EventContext = {
    model: Model;
    event: Event;
}

class EventResolver {
    private _pending = false;
    private _context: EventContext[] = [];

    /**
     * Queue a deferred event emitted during the current story.
     *
     * `Model.emit(event, { isDefer: true })` calls this instead of emitting
     * immediately.
     *
     * @param model - Producer model that emitted the event.
     * @param event - Event instance to emit when the story resolves.
     * @returns Nothing.
     */
    public register(model: Model, event: Event) {
        this._context.push({ model, event });
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
        if (this._pending) return handler();
        this._pending = true;
        const result = handler();
        this._pending = false;
        this.resolve();
        return result;
    }

    /**
     * Emit all deferred events synchronously and clear the queue.
     *
     * @returns Nothing.
     */
    public resolve() {
        const context = [...this._context];
        this._context.length = 0;
        context.forEach(({ model, event }) => {
            eventService.emitSync(model, event);
        });
    }
}

export const eventResolver = new EventResolver();
