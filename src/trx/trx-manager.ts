import { effectResolver } from "../effect/effect-resolver";
import { eventResolver } from "../event/event-resolver";
import { weakRefFieldResolver } from "../ref/weak-ref-field-resolver";
import { weakRefModelResolver } from "../ref/weak-ref-model-resolver";


class TrxManager {
    private _isPending = false;

    private tasks: Array<() => void> = [];

    public run(method: () => void) {
        if (this._isPending) return method();
        this._isPending = true;
        method();
        this.finish()
        this._isPending = false;
    }

    private finish() {
        effectResolver.resolve();
        eventResolver.resolve();
        weakRefFieldResolver.resolve();
        weakRefModelResolver.resolve();
        const tasks = [...this.tasks];
        this.tasks.length = 0;
        tasks.forEach(task => task());
    }

    public then(method: () => void) {
        this.tasks.push(method);
    }
}

export const trxManager = new TrxManager();
