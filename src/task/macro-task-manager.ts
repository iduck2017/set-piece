import { effectResolver } from "../effect/effect-resolver";
import { eventConsumerResolver } from "../event/event-consumer-resolver";
import { useConsoleLog } from "../log/use-console-log";
import { weakRefResolver } from "../ref/weak-ref-resolver";

class MacroTaskManager {
    private _isPending = false;

    private _handlers: Array<() => void> = [];

    @useConsoleLog()
    public run(handler: () => unknown) {
        if (this._isPending) return handler();
        console.group("MacroTaskManager.run");
        this._isPending = true;
        const result = handler();
        this._isPending = false;
        console.groupEnd()
        this.resolve()
        return result;
    }

    @useConsoleLog()
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
export const macroTaskManager = new MacroTaskManager();
