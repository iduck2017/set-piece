import { depManager } from "../dep/dep-manager";
import { Tag } from "../tag/tag-registry";
import { eventManager } from "../dep/dep-consumer-manager";
import { useLog } from "../log/use-log";
import { eventService } from "./event-service";
import { useMacroTask } from "../task/use-macro-task";

class EventConsumerResolver {
    private _context: Set<Tag> = new Set();

    @useMacroTask()
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

    private unbind(depConsumerTags: Tag[]) {
        depConsumerTags.forEach(depConsumerTag => {
            const depTags = depManager.query(depConsumerTag)
            depManager.remove(depConsumerTag);
            depTags.forEach((depTag: Tag) => {
                eventManager.remove(depTag, depConsumerTag);
            })
        })
    }

    @useLog()
    private reset(depConsumerTags: Tag[]) {
        depConsumerTags.forEach(depConsumerTag => {
            eventService.unbind(depConsumerTag);
            eventService.bind(depConsumerTag);
        })
    }
}

export const eventConsumerResolver = new EventConsumerResolver();
