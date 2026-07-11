import { Event } from ".";
import { eventService } from "./event-service";
import { Model } from "../model";
import { Method } from "../types";

type EventContext = {
    model: Model;
    event: Event;
}

class EventResolver {
    private _pending = false;
    private _context: EventContext[] = [];

    public register(model: Model, event: Event) {
        this._context.push({ model, event });
    }

    public launch(handler: () => unknown) {
        if (this._pending) return handler();
        this._pending = true;
        const result = handler();
        this._pending = false;
        this.resolve();
        return result;
    }

    public resolve() {
        const context = [...this._context];
        this._context.length = 0;
        context.forEach(({ model, event }) => {
            eventService.emitSync(model, event);
        });
    }
}

export const eventResolver = new EventResolver();

export function useStory() {
    return function(
        _prototype: unknown,
        _key: unknown,
        descriptor: TypedPropertyDescriptor<Method>,
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(...args: unknown[]) {
            const _handler = handler.bind(this, ...args);
            return eventResolver.launch(_handler);
        }
        return descriptor;
    }
}
