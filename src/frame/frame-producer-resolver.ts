import { Model } from "../model";
import { Tag } from "../tag/tag-registry";
import { FrameProducerLoader, frameProducerRegistry } from "./frame-producer-registry";
import { useAnime } from "./frame-resolver";
import { frameService } from "./frame-service";

class FrameProducerResolver {
    private _context: Set<Tag> = new Set();

    public register(tag: Tag) {
        this._context.add(tag);
    }

    @useAnime()
    public resolve() {
        const tags = [...this._context];
        this._context.clear();
        tags.forEach(tag => {
            const loader = frameProducerRegistry.query(tag.target, tag.key);
            if (!loader) return;
            const FrameConstructor = loader();
            const model = tag.target;
            const next = Reflect.get(model, tag.key);
            const frame = new FrameConstructor({ next });
            frameService.emit(model, frame);
        })
    }
}

export const frameProducerResolver = new FrameProducerResolver();

export function useFrameProducer<
    M extends Model & Record<string, any>,
    K extends string,
>(loader: FrameProducerLoader<M[K]>) {
    return function(
        prototype: M,
        key: K,
    ) {
        frameProducerRegistry.register(prototype, key, loader);
    }
}
