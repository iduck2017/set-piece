import { Method } from "../types";

class EventResolver {
    private _pending = false;
    private _handlers: Array<() => void> = [];

    public register(handler: () => void) {
        this._handlers.push(handler);
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
        const handlers = [...this._handlers];
        this._handlers.length = 0;
        handlers.forEach(handler => handler());
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
