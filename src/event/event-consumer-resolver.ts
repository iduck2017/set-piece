import { depManager } from "../dep/dep-manager";
import { Model } from "../model";
import { Tag } from "../tag/tag-registry";
import { eventManager } from "../dep/dep-consumer-manager";
import { eventService } from "./event-service";
import { useBlink } from "../hooks/use-blink";

class EventConsumerResolver {
    private _context: Set<Tag> = new Set();

    /**
     * Queue a changed dependency that may affect event consumer bindings.
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
     * Report whether event consumer binding refresh is pending.
     *
     * @returns True when at least one changed dependency tag is queued.
     */
    public check() {
        return Boolean(this._context.size);
    }

    /**
     * Refresh event consumer bindings affected by changed dependencies.
     *
     * This maps changed dependency tags to consumer method tags, removes stale
     * dependency edges, then re-runs the affected consumer loaders.
     *
     * @returns Nothing.
     */
    public resolve() {
        const depTags = [...this._context];
        this._context.clear();
        const depConsumerTags = eventManager.query(depTags);
        this.unbind(depConsumerTags);
        this.reset(depConsumerTags);
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
                eventManager.remove(depTag, depConsumerTag);
            })
        })
    }

    /**
     * Rebind runtime event links for affected consumer tags.
     *
     * @param depConsumerTags - Consumer method tags that should be rebound.
     * @returns Nothing.
     */
    private reset(depConsumerTags: Tag[]) {
        depConsumerTags.forEach(depConsumerTag => {
            eventService.unbind(depConsumerTag);
            eventService.bind(depConsumerTag);
        })
    }
}

export const eventConsumerResolver = new EventConsumerResolver();
