import { Tag } from "../tag/tag-registry";
import { frameProducerRegistry } from "./frame-producer-registry";
import { useAnime } from "../hooks/use-anime";
import { frameService } from "./frame-service";

class FrameProducerResolver {
    private _queue: Set<Tag> = new Set();

    /**
     * Queue a producer property tag whose value changed during an action.
     *
     * `depService.register()` calls this for every reactive write. At anime
     * resolution, matching producer registrations emit diff frames.
     *
     * @param tag - Tag for the changed producer property.
     * @returns Nothing.
     */
    public register(tag: Tag) {
        this._queue.add(tag);
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
        const tags = [...this._queue];
        this._queue.clear();
        tags.forEach(tag => {
            const loader = frameProducerRegistry.query(tag.target, tag.key);
            if (!loader) return;
            const FrameCtor = loader();
            const model = tag.target;
            const next = Reflect.get(model, tag.key);
            const frame = new FrameCtor({ next });
            frameService.emit(model, frame);
        })
    }
}

export const frameProducerResolver = new FrameProducerResolver();
