import { useBlink } from "../hooks/use-blink";
import type { Model } from "../model";

class ModelResolver {
    private readonly _context: Set<Model> = new Set();

    @useBlink()
    /**
     * Queue a freshly constructed model for initialization.
     *
     * `useModel()` and `useView()` call this after construction. The actual
     * initialization is deferred to the blink resolver.
     *
     * @param model - Model instance to initialize.
     * @returns Nothing.
     */
    public register(model: Model) {
        this._context.add(model);
    }

    /**
     * Report whether model initialization is waiting for the next blink.
     *
     * @returns True when one or more models are queued.
     */
    public check() {
        return Boolean(this._context.size);
    }

    /**
     * Initialize all queued models and clear the queue.
     *
     * This calls the model internal init hook that binds memos, effects,
     * decors, events, and frames.
     *
     * @returns Nothing.
     */
    public resolve() {
        const models = [...this._context];
        this._context.clear();
        models.forEach(model => {
            model._internal.init();
        });
    }
}

export const modelResolver = new ModelResolver();
