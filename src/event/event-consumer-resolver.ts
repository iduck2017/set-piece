import { depManager } from "../dep/dep-manager";
import { Model } from "../model";
import { Tag } from "../tag/tag-registry";
import { eventManager } from "../dep/dep-consumer-manager";
import { eventService } from "./event-service";
import { useBlink } from "../hooks/use-blink";

class EventConsumerResolver {
    private _queue: Set<Tag> = new Set();

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
        this._queue.add(depTag);
    }

    /**
     * Report whether event consumer binding refresh is pending.
     *
     * @returns True when at least one changed dependency tag is queued.
     */
    public check() {
        return Boolean(this._queue.size);
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
        const depTags = [...this._queue];
        this._queue.clear();
        const consumerTags = eventManager.query(depTags);
        this.unbind(consumerTags);
        this.reset(consumerTags);
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
                eventManager.remove(depTag, consumerTag);
            })
        })
    }

    /**
     * Rebind runtime event links for affected consumer tags.
     *
     * @param consumerTags - Consumer method tags that should be rebound.
     * @returns Nothing.
     */
    private reset(consumerTags: Tag[]) {
        consumerTags.forEach(consumerTag => {
            eventService.unbind(consumerTag);
            eventService.bind(consumerTag);
        })
    }
}

export const eventConsumerResolver = new EventConsumerResolver();
