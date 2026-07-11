import { depManager } from "../dep/dep-manager";
import { Model } from "../model";
import { Tag } from "../tag/tag-registry";
import { eventManager } from "../dep/dep-consumer-manager";
import { eventService } from "./event-service";
import { useBlink } from "../action/blink-manager";

class EventConsumerResolver {
    private _context: Set<Tag> = new Set();

    @useBlink()
    public register(depTag: Tag) {
        this._context.add(depTag);
    }

    public check() {
        return Boolean(this._context.size);
    }

    public resolve() {
        const depTags = [...this._context];
        this._context.clear();
        const depConsumerTags = eventManager.query(depTags);
        this.unbind(depConsumerTags);
        this.reset(depConsumerTags);
    }

    private unbind(depConsumerTags: Tag[]) {
        depConsumerTags.forEach(depConsumerTag => {
            const depTags = depManager.query(depConsumerTag)
            depManager.remove(depConsumerTag);
            depTags.forEach((depTag: Tag) => {
                eventManager.remove(depTag, depConsumerTag);
            })
        })
    }

    private reset(depConsumerTags: Tag[]) {
        depConsumerTags.forEach(depConsumerTag => {
            eventService.unbind(depConsumerTag);
            eventService.bind(depConsumerTag);
        })
    }
}

export const eventConsumerResolver = new EventConsumerResolver();
