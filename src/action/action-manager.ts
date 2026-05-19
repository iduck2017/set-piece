import { deferEffectResolver } from "../effect/defer-effect-resolver";
import { eventConsumerResolver } from "../event/event-consumer-resolver";
import { frameConsumerResolver } from "../frame/frame-consumer-resolver";
import { weakRefResolver } from "../ref/weak-ref-resolver";
import { Method } from "../types";

class ActionManager {
    private _pending = false;
    private _thenners: Array<() => void> = [];

    public launch(handler: () => unknown) {
        if (this._pending) return handler();
        // console.group("ActionManager.run");
        this._pending = true;
        const result = handler();
        this._pending = false;
        // console.groupEnd()
        this.resolve()
        return result;
    }

    private resolve() {
        deferEffectResolver.resolve();
        eventConsumerResolver.resolve();
        frameConsumerResolver.resolve();
        weakRefResolver.resolve();
        const handlers = [...this._thenners];
        this._thenners.length = 0;
        handlers.forEach(handler => handler());
    }

    @useAction()
    public then(handler: () => void) {
        this._thenners.push(handler);
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
            const _handler = handler.bind(this, ...args)
            const result = actionManager.launch(_handler);
            return result
        }
        return descriptor;
    }
}
