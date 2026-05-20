import { depManager } from "../../common/dep/dep-manager";
import { Model } from "..";
import { Tag } from "../../common/tag/tag-registry";
import { eventManager } from "../../common/dep/dep-consumer-manager";
import { eventService } from "./event-service";
import { useAction } from "../../common/action/manager";

class EventConsumerResolver {
    private _context: Set<Tag> = new Set();

    @useAction()
    public register(depTag: Tag) {
        this._context.add(depTag);
    }

    public resolve() {
        const depTags = [...this._context];
        this._context.clear();
        const depConsumerTags = eventManager.query(depTags);
        this.unbind(depConsumerTags);
        this.reset(depConsumerTags);
    }

    private unbind(depConsumerTags: Tag<Model>[]) {
        depConsumerTags.forEach(depConsumerTag => {
            const depTags = depManager.query(depConsumerTag)
            depManager.remove(depConsumerTag);
            depTags.forEach((depTag: Tag) => {
                eventManager.remove(depTag, depConsumerTag);
            })
        })
    }

    private reset(depConsumerTags: Tag<Model>[]) {
        depConsumerTags.forEach(depConsumerTag => {
            eventService.unbind(depConsumerTag);
            eventService.bind(depConsumerTag);
        })
    }
}

export const eventConsumerResolver = new EventConsumerResolver();
