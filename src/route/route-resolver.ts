import { useBlink } from "../hooks/use-blink";
import type { Model } from "../model";

class RouteResolver {
    private _queue: Set<Model> = new Set();

    /**
     * Queue a model whose parent/root route may have changed.
     *
     * Mount and unmount operations call this instead of rerouting immediately.
     * The actual route refresh runs at the end of the current blink.
     *
     * @param model - Model that starts the route refresh subtree.
     * @returns Nothing.
     */
    @useBlink()
    public register(model: Model) {
        this._queue.add(model);
    }

    /**
     * Report whether any route refresh is waiting for the next blink.
     *
     * @returns True when at least one model is queued.
     */
    public check() {
        return Boolean(this._queue.size);
    }

    /**
     * Refresh queued model routes and clear the queue.
     *
     * Each queued model reroutes itself and its descendants, so repeated queue
     * entries collapse to one route pass per queued subtree.
     *
     * @returns Nothing.
     */
    public resolve() {
        const models = [...this._queue];
        this._queue.clear();
        models.forEach(model => {
            model._internal.reroute();
        });
    }
}

export const routeResolver = new RouteResolver();
