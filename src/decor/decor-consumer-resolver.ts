import { depManager } from "../dep/dep-manager";
import { Tag } from "../tag/tag-registry";
import { decorManager } from "../dep/dep-consumer-manager";
import { decorService } from "./decor-service";
import { useBlink } from "../hooks/use-blink";

/**
 * Refreshes decor consumer bindings when loader dependencies change.
 */
class DecorConsumerResolver {
    private _queue: Set<Tag> = new Set();

    /**
     * Queue a changed dependency that may affect decor consumer bindings.
     *
     * `depService.register()` calls this after reactive state changes. The
     * queued tag is resolved at the end of the current blink.
     *
     * @param depTag - Dependency tag that changed.
     * @returns Nothing.
     */
    @useBlink()
    public register(depTag: Tag) {
        this._queue.add(depTag);
    }

    /**
     * Report whether decor consumer binding refresh is pending.
     *
     * @returns True when at least one changed dependency tag is queued.
     */
    public check() {
        return Boolean(this._queue.size)
    }

    /**
     * Refresh decor consumer bindings affected by changed dependencies.
     *
     * This maps changed dependency tags to consumer method tags, removes stale
     * dependency edges, then re-runs the affected consumer loaders.
     *
     * @returns True when at least one consumer binding was refreshed.
     */
    public resolve(): boolean {
        const depTags = [...this._queue];
        this._queue.clear();
        const consumerTags = decorManager.query(depTags);
        if (!consumerTags.length) return false;
        this.unbind(consumerTags);
        this.reset(consumerTags);
        return true
    }

    /**
     * Remove old dependency edges before consumer loaders re-run.
     *
     * @param consumerTags - Consumer method tags whose loaders changed.
     * @returns Nothing.
     */
    private unbind(consumerTags: Tag[]) {
        consumerTags.forEach(consumerTag => {
            const depTags = depManager.query(consumerTag)
            depManager.remove(consumerTag);
            depTags.forEach((depTag: Tag) => {
                decorManager.remove(depTag, consumerTag);
            })
        })
    }

    /**
     * Rebind runtime decor links for affected consumer tags.
     *
     * @param consumerTags - Consumer method tags that should be rebound.
     * @returns Nothing.
     */
    private reset(consumerTags: Tag[]) {
        consumerTags.forEach(consumerTag => {
            decorService.unbind(consumerTag);
            decorService.bind(consumerTag);
        })
    }
}

export const decorConsumerResolver = new DecorConsumerResolver();
