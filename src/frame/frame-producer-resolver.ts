import { Tag } from "../tag/tag-registry";
import { frameProducerRegistry } from "./frame-producer-registry";
import { useAnime } from "../hooks/use-anime";
import { frameService } from "./frame-service";

/**
 * Emits diff frames for dependency-backed producer changes.
 */
class FrameProducerResolver {
    private _queue: Map<Tag, unknown> = new Map();

    /**
     * Queue a producer property tag whose value changed during an action.
     *
     * `depService.register()` calls this for every reactive write. At anime
     * resolution, matching producer registrations emit diff frames.
     *
     * @param tag - Tag for the changed producer property.
     * @param prev - Value before the change; only the first value per batch is kept.
     * @returns Nothing.
     */
    public register(tag: Tag, prev: unknown) {
        if (this._queue.has(tag)) return;
        this._queue.set(tag, Array.isArray(prev) ? prev.slice() : prev);
    }

    /** Report whether any producer changes are waiting to emit frames. */
    public check() {
        return Boolean(this._queue.size);
    }

    /**
     * Emit diff frames for all queued producer property changes.
     *
     * This runs inside the anime boundary. For each changed property with a
     * registered frame producer, it builds the configured diff frame and queues
     * it through `frameService.emit()`.
     *
     * @returns Nothing.
     */
    @useAnime()
    public resolve() {
        const diffs = [...this._queue];
        this._queue.clear();
        diffs.forEach(([tag, prev]) => {
            const loader = frameProducerRegistry.query(tag.target, tag.key);
            if (!loader) return;
            const FrameCtor = loader();
            const model = tag.target;
            const value = Reflect.get(model, tag.key);
            const next = Array.isArray(value) ? value.slice() : value;
            const frame = new FrameCtor({ prev, next });
            frameService.emit(model, frame);
        })
    }
}

export const frameProducerResolver = new FrameProducerResolver();
