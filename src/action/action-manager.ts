import { effectResolver } from "../effect/effect-resolver";
import { eventConsumerResolver } from "../event/event-consumer-resolver";
import { useLog } from "../log/use-log";
import { weakRefResolver } from "../ref/weak-ref-resolver";

class ActionManager {
    private _isPending = false;

    private _handlers: Array<() => void> = [];

    @useLog()
    public run(handler: () => unknown) {
        if (this._isPending) return handler();
        console.group("ActionManager.run");
        this._isPending = true;
        const result = handler();
        this._isPending = false;
        console.groupEnd()
        this.resolve()
        return result;
    }

    @useLog()
    private resolve() {
        effectResolver.resolve();
        eventConsumerResolver.resolve();
        weakRefResolver.resolve();
        const handlers = [...this._handlers];
        this._handlers.length = 0;
        handlers.forEach(handler => handler());
    }

    public then(handler: () => void) {
        this._handlers.push(handler);
    }
}
export const actionManager = new ActionManager();
