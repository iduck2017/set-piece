import { deferEffectResolver } from "../effect/defer-effect-resolver";
import { eventConsumerResolver } from "../event/event-consumer-resolver";
import { frameConsumerResolver } from "../frame/frame-consumer-resolver";
import { frameProducerResolver } from "../frame/frame-producer-resolver";
import { Method } from "../types";

class ActionManager {
    private _pending = false;
    private _handlers: Array<() => void> = [];

    public launch(handler: () => unknown) {
        if (this._pending) return handler();
        this._pending = true;
        const result = handler();
        this._pending = false;
        this.resolve()
        return result;
    }

    private resolve() {
        deferEffectResolver.resolve();
        eventConsumerResolver.resolve();
        frameConsumerResolver.resolve();
        frameProducerResolver.resolve();
        const handlers = [...this._handlers];
        this._handlers.length = 0;
        handlers.forEach(handler => handler());
    }

    @useAction()
    public then(handler: () => void) {
        this._handlers.push(handler);
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

export function useDeferAction() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<Method<void>>,
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(...args: any[]) {
            const _handler = handler.bind(this, ...args)
            actionManager.then(_handler);
        }
        return descriptor;
    }
}
