import { deferEffectResolver } from "../effect/defer-effect-resolver";
import { eventConsumerResolver } from "../event/event-consumer-resolver";
import { useStory } from "../event/event-resolver";
import { frameConsumerResolver } from "../frame/frame-consumer-resolver";
import { frameProducerResolver } from "../frame/frame-producer-resolver";
import { Method } from "../types";

export class ActionManager {
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
        this.resolve()
        return result;
    }

    @useStory()
    private resolve() {
        deferEffectResolver.resolve();
        eventConsumerResolver.resolve();
        frameConsumerResolver.resolve();
        frameProducerResolver.resolve();
        const handlers = [...this._handlers];
        this._handlers.length = 0;
        handlers.forEach(handler => handler());
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
            actionManager.register(_handler);
        }
        return descriptor;
    }
}
