import { depManager } from "../dep/dep-manager";
import { Tag } from "../tag/tag-registry";
import { decorManager } from "../dep/dep-consumer-manager";
import { decorService } from "./decor-service";
import { useBlink } from "../hooks/use-blink";

class DecorConsumerResolver {
    private _context: Set<Tag> = new Set();

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
        this._context.add(depTag);
    }

    /**
     * Report whether decor consumer binding refresh is pending.
     *
     * @returns True when at least one changed dependency tag is queued.
     */
    public check() {
        return Boolean(this._context.size)
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
        const depTags = [...this._context];
        this._context.clear();
        const depConsumerTags = decorManager.query(depTags);
        if (!depConsumerTags.length) return false;
        this.unbind(depConsumerTags);
        this.reset(depConsumerTags);
        return true
    }

    /**
     * Remove old dependency edges before consumer loaders re-run.
     *
     * @param depConsumerTags - Consumer method tags whose loaders changed.
     * @returns Nothing.
     */
    private unbind(depConsumerTags: Tag[]) {
        depConsumerTags.forEach(depConsumerTag => {
            const depTags = depManager.query(depConsumerTag)
            depManager.remove(depConsumerTag);
            depTags.forEach((depTag: Tag) => {
                decorManager.remove(depTag, depConsumerTag);
            })
        })
    }

    /**
     * Rebind runtime decor links for affected consumer tags.
     *
     * @param depConsumerTags - Consumer method tags that should be rebound.
     * @returns Nothing.
     */
    private reset(depConsumerTags: Tag[]) {
        depConsumerTags.forEach(depConsumerTag => {
            decorService.unbind(depConsumerTag);
            decorService.bind(depConsumerTag);
        })
    }
}

export const decorConsumerResolver = new DecorConsumerResolver();
