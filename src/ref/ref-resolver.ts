import type { Model } from "../model";
import { refConsumerRegistry } from "./ref-consumer-registry";
import { refRegistry } from "./ref-registry";

/**
 * Removes ref links whose models no longer share the same root.
 */
class RefResolver {
    private _queue: Set<Model> = new Set();

    /**
     * Queue a model whose root may have changed during reroute.
     *
     * @param model - Model to validate at the end of the current action.
     * @returns Nothing.
     */
    public register(model: Model) {
        this._queue.add(model);
    }

    /**
     * Validate active and passive refs for every rerouted model.
     *
     * @returns Nothing.
     */
    public resolve() {
        const models = [...this._queue];
        this._queue.clear();
        models.forEach(model => {
            this.resolveRefs(model);
            this.resolveConsumers(model);
        });
    }

    /**
     * Remove refs held by a model when their roots no longer match.
     *
     * @param model - Holder model whose ref fields should be checked.
     * @returns Nothing.
     */
    private resolveRefs(model: Model) {
        const root = model.root;
        const keys = refRegistry.query(model);
        keys.forEach(key => {
            const value = Reflect.get(model, key);
            if (value instanceof Array) {
                for (let index = value.length - 1; index >= 0; index -= 1) {
                    const ref: Model | undefined = value[index];
                    if (!ref || ref.root === root) continue;
                    value.splice(index, 1);
                }
                return;
            }
            const ref: Model | undefined = value;
            if (!ref || ref.root === root) return;
            Reflect.set(model, key, undefined);
        });
    }

    /**
     * Remove fields that reference a model from a different root.
     *
     * @param model - Referenced model whose holders should be checked.
     * @returns Nothing.
     */
    private resolveConsumers(model: Model) {
        const root = model.root;
        const tags = refConsumerRegistry.query(model);
        tags.forEach(tag => {
            const holder = tag.target;
            if (holder.root === root) return;
            const value = Reflect.get(holder, tag.key);
            if (value === model) {
                Reflect.set(holder, tag.key, undefined);
                return;
            }
            if (!(value instanceof Array)) return;
            for (let index = value.length - 1; index >= 0; index -= 1) {
                if (value[index] !== model) continue;
                value.splice(index, 1);
            }
        });
    }
}

export const refResolver = new RefResolver();
