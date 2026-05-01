import { deferEffectResolver } from "../effect/defer-effect-resolver";
import { eventConsumerResolver } from "../event/event-consumer-resolver";
import { weakRefResolver } from "../ref/weak-ref-resolver";
import { useAction } from "./use-action";

class ActionManager {
    private _isPending = false;

    private _handlers: Array<() => void> = [];

    public run(handler: () => unknown) {
        if (this._isPending) return handler();
        // console.group("ActionManager.run");
        this._isPending = true;
        const result = handler();
        this._isPending = false;
        // console.groupEnd()
        this.resolve()
        return result;
    }

    private resolve() {
        deferEffectResolver.resolve();
        eventConsumerResolver.resolve();
        weakRefResolver.resolve();
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
