import { depManager } from "../dep/dep-manager";
import { Model } from "../model";
import { Tag } from "../tag/tag-registry";
import { effectManager } from "../dep/dep-consumer-manager";
import { useAction } from "../hooks/use-action";

class EffectResolver {
    private _context: Set<Tag> = new Set();

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
        this._context.add(depTag);
    }

    /**
     * Report whether any effect dependency changed during the action.
     *
     * @returns True when at least one changed dependency tag is queued.
     */
    public check() {
        return Boolean(this._context.size);
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
        const depTags = [...this._context];
        this._context.clear();
        const depConsumerTags = effectManager.query(depTags);
        this.unbind(depConsumerTags);
        this.emit(depConsumerTags);
    }

    /**
     * Remove stale dependency edges before an effect re-collects deps.
     *
     * @param depConsumerTags - Effect consumer tags that will run again.
     * @returns Nothing.
     */
    private unbind(depConsumerTags: Tag[]) {
        depConsumerTags.forEach(depConsumerTag => {
            const depTags = depManager.query(depConsumerTag)
            depManager.remove(depConsumerTag);
            depTags.forEach((depTag: Tag) => {
                effectManager.remove(depTag, depConsumerTag);
            })
        })
    }

    /**
     * Invoke effect methods so they can collect fresh dependencies.
     *
     * @param depConsumerTags - Effect consumer tags to execute.
     * @returns Nothing.
     */
    private emit(depConsumerTags: Tag[]) {
        depConsumerTags.forEach(depConsumerTag => {
            const model = depConsumerTag.target;
            const key = depConsumerTag.key;
            const effect = Reflect.get(model, key);
            if (!(effect instanceof Function)) return;
            effect.call(model);
        })
    }
}

export const effectResolver = new EffectResolver();
