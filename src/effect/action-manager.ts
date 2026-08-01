import { effectResolver } from "./effect-resolver";
import { eventProducerResolver } from "../event/event-producer-resolver";
import { frameProducerResolver } from "../frame/frame-producer-resolver";
import { refResolver } from "../ref/ref-resolver";

/**
 * Coordinates action boundaries and flushes action-scoped work.
 */
export class ActionManager {
    private _pending = false;

    /**
     * Execute one action and flush action-scoped resolvers at the boundary.
     *
     * Nested actions reuse the outer action so effects and producers flush once
     * after the outermost mutation finishes.
     *
     * @param handler - Operation that may mutate dependency-backed state.
     * @returns The handler result.
     */
    public launch(handler: () => unknown) {
        if (this._pending) return handler();
        this._pending = true;
        const output = handler();
        this._pending = false;
        this.resolve();
        return output;
    }

    /**
     * Flush work that should happen after user state mutation settles.
     *
     * Refs are validated first, then effects and producers process the final
     * action state.
     *
     * @returns Nothing.
     */
    private resolve() {
        refResolver.resolve();
        effectResolver.resolve();
        eventProducerResolver.resolve();
        frameProducerResolver.resolve();
    }
}

export const actionManager = new ActionManager();
