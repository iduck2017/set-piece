import { Decor } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag, tagRegistry } from "../tag/tag-registry";
import { decorProducerRegistry } from "./decor-producer-registry";
import { decorProducerDelegator } from "./decor-producer-delegator";
import { depService } from "../dep/dep-service";
import { useBlink } from "../hooks/use-blink";

class DecorProducerResolver {
    private _context: Set<Tag> = new Set();

    /**
     * Report whether decorated producer values need recomputation.
     *
     * @returns True when at least one producer tag is queued.
     */
    public check() {
        return Boolean(this._context.size)
    }

    public register(decorProducerTag: Tag): void
    public register(decorProducerModel: Model, decorType: Constructor<Decor>): void;

    /**
     * Queue a producer tag directly or by matching a producer/decor pair.
     *
     * The direct form is used by producer property writes. The model/decor form
     * is used when consumer bindings change and any affected producer values
     * need to be recalculated.
     *
     * @param arg - Producer tag, or producer model used for decor-type lookup.
     * @param decorType - Decor constructor used with the producer model form.
     * @returns Nothing.
     */
    @useBlink()
    public register(arg: Tag | Model, decorType?: Constructor<Decor>) {
        if (arg instanceof Model) {
            if (!decorType) return;
            const decorProducerModel = arg;
            const subConfig = decorProducerRegistry.query(decorProducerModel)
            subConfig.forEach((decorProducerLoader, key) => {
                if (decorProducerLoader() === decorType) {
                    const decorProducerTag = tagRegistry.query(decorProducerModel, key);
                    this.register(decorProducerTag)
                }
            })
        } else this._context.add(arg);
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
        const depProducerTags = [...this._context];
        this._context.clear();

        if (!depProducerTags) return false;
        depProducerTags.forEach(decorProducerTag => {
            const decorProducerModel = decorProducerTag.target;
            const decorProducerKey = decorProducerTag.key;
            const prev = Reflect.get(decorProducerModel, decorProducerKey);
            decorProducerDelegator.clear(decorProducerTag);
            const next = Reflect.get(decorProducerModel, decorProducerKey);
            if (prev !== next) {
                depService.register(decorProducerTag);
            }
        });
        return true;
    }
}
export const decorProducerResolver = new DecorProducerResolver();
