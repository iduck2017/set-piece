import { depManager } from "../dep/dep-manager";
import { Model } from "../model";
import { Tag } from "../tag/tag-registry";
import { effectManager } from "../dep/dep-consumer-manager";
import { useAction } from "../hooks/use-action";

class EffectResolver {
    private _queue: Set<Tag> = new Set();

    /**
     * Queue a changed dependency tag for action-scoped effects.
     *
     * `DepService` calls this after reactive writes. The queued tags are
     * resolved at the end of the current action.
     *
     * @param depTag - Dependency tag whose value changed.
     * @returns Nothing.
     */
    @useAction()
    public register(depTag: Tag) {
        this._queue.add(depTag);
    }

    /**
     * Report whether any effect dependency changed during the action.
     *
     * @returns True when at least one changed dependency tag is queued.
     */
    public check() {
        return Boolean(this._queue.size);
    }

    /**
     * Re-run all effects affected by queued dependency changes.
     *
     * The resolver maps changed dependency tags to effect consumer tags,
     * removes old dependency edges, then invokes each effect method so it can
     * collect fresh dependencies.
     *
     * @returns Nothing.
     */
    public resolve() {
        const depTags = [...this._queue];
        this._queue.clear();
        const consumerTags = effectManager.query(depTags);
        this.unbind(consumerTags);
        this.emit(consumerTags);
    }

    /**
     * Remove stale dependency edges before an effect re-collects deps.
     *
     * @param consumerTags - Effect consumer tags that will run again.
     * @returns Nothing.
     */
    private unbind(consumerTags: Tag[]) {
        consumerTags.forEach(consumerTag => {
            const depTags = depManager.query(consumerTag)
            depManager.remove(consumerTag);
            depTags.forEach((depTag: Tag) => {
                effectManager.remove(depTag, consumerTag);
            })
        })
    }

    /**
     * Invoke effect methods so they can collect fresh dependencies.
     *
     * @param consumerTags - Effect consumer tags to execute.
     * @returns Nothing.
     */
    private emit(consumerTags: Tag[]) {
        consumerTags.forEach(consumerTag => {
            const model = consumerTag.target;
            const key = consumerTag.key;
            const effect = Reflect.get(model, key);
            if (!(effect instanceof Function)) return;
            effect.call(model);
        })
    }
}

export const effectResolver = new EffectResolver();
