import { depCollector } from "../dep/dep-collector";
import { depManager } from "../dep/dep-manager";
import { depService } from "../dep/dep-service";
import { Model } from "../model";
import { Tag } from "../tag/tag-registry";
import { memoDelegator } from "./memo-delegator";
import { memoManager } from "../dep/dep-consumer-manager";
import { useBlink } from "../hooks/use-blink";

class MemoResolver {
    private _context: Set<Tag> = new Set();

    /**
     * Queue a changed dependency tag for memo invalidation.
     *
     * `DepService` calls this after reactive writes. The tag is resolved at the
     * end of the current blink.
     *
     * @param tag - Dependency tag whose value changed.
     * @returns Nothing.
     */
    @useBlink()
    public register(tag: Tag) {
        this._context.add(tag);
    }

    /**
     * Report whether memo invalidation is pending.
     *
     * @returns True when at least one changed dependency tag is queued.
     */
    public check() {
        return Boolean(this._context.size)
    }

    /**
     * Invalidate affected memos and propagate changes if values differ.
     *
     * The resolver maps changed dependency tags to memo consumer tags, clears
     * stale dependency edges, recomputes memo values, and notifies dependents
     * when a memo output changes.
     *
     * @returns True when at least one memo was recomputed.
     */
    public resolve(): boolean {
        const depTags = [...this._context];
        this._context.clear();
        const consumerTags = memoManager.query(depTags);
        if (!consumerTags.length) return false;
        this.unbind(consumerTags);
        this.reset(consumerTags);
        return true;
    }

    /**
     * Remove stale dependency edges before recomputing memo getters.
     *
     * @param consumerTags - Memo consumer tags that will be recomputed.
     * @returns Nothing.
     */
    private unbind(consumerTags: Tag[]) {
        consumerTags.forEach(consumerTag => {
            const depTags = depManager.query(consumerTag)
            depManager.remove(consumerTag);
            depTags.forEach((depTag: Tag) => {
                memoManager.remove(depTag, consumerTag);
            })
        })
    }

    /**
     * Recompute memo getters and notify dependents when output changes.
     *
     * @param consumerTags - Memo consumer tags that should be reset.
     * @returns Nothing.
     */
    private reset(consumerTags: Tag[]) {
        consumerTags.forEach(consumerTag => {
            const model = consumerTag.target;
            const key = consumerTag.key;
            const prev = Reflect.get(model, key);
            memoDelegator.clear(consumerTag);
            const next = Reflect.get(model, key);
            memoDelegator.update(consumerTag, next);
            if (prev !== next) {
                depService.register(consumerTag);
            }
        })
    }
}

export const memoResolver = new MemoResolver();
