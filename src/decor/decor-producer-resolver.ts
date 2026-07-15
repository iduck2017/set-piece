import { Decor } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag, tagRegistry } from "../tag/tag-registry";
import { decorProducerRegistry } from "./decor-producer-registry";
import { decorProducerDelegator } from "./decor-producer-delegator";
import { depService } from "../dep/dep-service";
import { useBlink } from "../hooks/use-blink";

/**
 * Recomputes decorated producer values after source or binding changes.
 */
class DecorProducerResolver {
    private _queue: Set<Tag> = new Set();

    /**
     * Report whether decorated producer values need recomputation.
     *
     * @returns True when at least one producer tag is queued.
     */
    public check() {
        return Boolean(this._queue.size)
    }

    public register(tag: Tag): void
    public register(model: Model, DecorCtor: Constructor<Decor>): void;

    /**
     * Queue a producer tag directly or by matching a producer/decor pair.
     *
     * The direct form is used by producer property writes. The model/decor form
     * is used when consumer bindings change and any affected producer values
     * need to be recalculated.
     *
     * @param target - Producer tag, or producer model used for decor-type lookup.
     * @param DecorCtor - Decor constructor used with the producer model form.
     * @returns Nothing.
     */
    @useBlink()
    public register(target: Tag | Model, DecorCtor?: Constructor<Decor>) {
        if (target instanceof Model) {
            /** Consumer changes register by decor type, so find matching producers. */
            if (!DecorCtor) return;
            const model = target;
            const loaders = decorProducerRegistry.query(model)
            loaders.forEach((loader, key) => {
                if (loader() === DecorCtor) {
                    const tag = tagRegistry.query(model, key);
                    this.register(tag)
                }
            })
        } else this._queue.add(target);
    }

    /**
     * Recompute decorated values and propagate changes when results differ.
     *
     * Each queued producer cache is cleared, the property is read again to run
     * decor composition, and `depService` is notified if the decorated value
     * changed.
     *
     * @returns True after the resolver drains its queue.
     */
    public resolve(): boolean {
        /** Snapshot and clear first so recomputation can queue the next wave. */
        const tags = [...this._queue];
        this._queue.clear();
        if (!tags) return false;
        tags.forEach(tag => {
            /** Read the previous decorated value before clearing the cache. */
            const model = tag.target;
            const key = tag.key;
            const prev = Reflect.get(model, key);
            /** Clear and read again to rebuild the decor result. */
            decorProducerDelegator.clear(tag);
            const next = Reflect.get(model, key);
            /** Notify dependents only if the visible decorated value changed. */
            if (prev !== next) {
                depService.register(tag);
            }
        });
        return true;
    }
}
export const decorProducerResolver = new DecorProducerResolver();
