import { effectResolver } from "./effect-resolver";
import { eventProducerResolver } from "../event/event-producer-resolver";
import { frameProducerResolver } from "../frame/frame-producer-resolver";
import { decorProducerResolver } from "../decor/decor-producer-resolver";
import { useAction } from "../hooks/use-action";

/**
 * Coordinates action boundaries and flushes action-scoped work.
 */
export class ActionManager {
    private _pending = false;

    /**
     * Execute one action and flush action-scoped resolvers at the boundary.
     *
     * Nested actions reuse the outer action. Pending work is flushed after the
     * outermost handler finishes, including work queued during a resolve round.
     *
     * @param handler - Operation that may mutate dependency-backed state.
     * @returns The handler result.
     */
    public launch(handler: () => unknown) {
        if (this._pending) return handler();
        this._pending = true;
        const output = handler();
        this._pending = false;
        if (!this.precheck()) return output;
        this.resolve();
        return output;
    }

    /** Report whether another action resolve round has pending work. */
    protected precheck() {
        return effectResolver.check() ||
            decorProducerResolver.check() ||
            eventProducerResolver.check() ||
            frameProducerResolver.check();
    }

    /**
     * Flush work that should happen after user state mutation settles.
     *
     * Effects run first, followed by decor recomputation and change signals.
     * Nested actions reuse this boundary; remaining work runs after this round.
     *
     * @returns Nothing.
     */
    @useAction()
    private resolve() {
        effectResolver.resolve();
        decorProducerResolver.resolve();
        eventProducerResolver.resolve();
        frameProducerResolver.resolve();
    }
}

export const actionManager = new ActionManager();
