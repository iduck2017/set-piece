import { ChangeFrame } from ".";
import { Model } from "../../model";
import { Constructor } from "../../types";
import { Tag } from "../tag/tag-registry";
import { frameService } from "./frame-service";

type Entry = {
    prev: any;
    FrameConstructor: Constructor<ChangeFrame>;
}

class FrameProducerResolver {
    private _context: Map<Tag<Model>, Entry> = new Map();

    public register(
        tag: Tag<Model>,
        prev: any,
        FrameConstructor: Constructor<ChangeFrame>,
    ) {
        if (this._context.has(tag)) return;
        this._context.set(tag, { prev, FrameConstructor });
    }

    public resolve() {
        const entries = [...this._context];
        this._context.clear();
        entries.forEach(([tag, { prev, FrameConstructor }]) => {
            const model = tag.target;
            const next = Reflect.get(model, tag.key);
            if (prev === next) return;
            const frame = new FrameConstructor({ prev, next });
            frameService.emit(model, frame);
        })
    }
}

export const frameProducerResolver = new FrameProducerResolver();
