import { effectResolver } from "../effect/effect-resolver";
import { eventProducerResolver } from "../event/event-producer-resolver";
import { frameProducerResolver } from "../frame/frame-producer-resolver";
import { Method } from "../types";

export class ActionManager {
    private _pending = false;

    public launch(handler: () => unknown) {
        if (this._pending) return handler();
        this._pending = true;
        const result = handler();
        this._pending = false;
        this.resolve();
        return result;
    }

    private resolve() {
        effectResolver.resolve();
        eventProducerResolver.resolve();
        frameProducerResolver.resolve();
    }
}

export const actionManager = new ActionManager();

export function useAction() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<Method>,
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(...args: unknown[]) {
            const _handler = handler.bind(this, ...args);
            const result = actionManager.launch(_handler);
            return result;
        };
        return descriptor;
    };
}
