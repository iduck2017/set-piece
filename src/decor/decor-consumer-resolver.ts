import { depManager } from "../dep/dep-manager";
import { Tag } from "../tag/tag-registry";
import { decorManager } from "../dep/dep-consumer-manager";
import { useLog } from "../log/use-log";
import { decorService } from "./decor-service";
import { useMicroTask } from "../task/use-micro-task";

class DecorConsumerResolver {
    private _context: Set<Tag> = new Set();

    @useMicroTask()
    public register(depTag: Tag) {
        this._context.add(depTag);
    }

    public check() {
        return Boolean(this._context.size)
    }

    public resolve(): boolean {
        const depTags = [...this._context];
        this._context.clear();
        const depConsumerTags = decorManager.query(depTags);
        if (!depConsumerTags.length) return false;
        this.unbind(depConsumerTags);
        this.reset(depConsumerTags);
        return true
    }

    private unbind(depConsumerTags: Tag[]) {
        depConsumerTags.forEach(depConsumerTag => {
            const depTags = depManager.query(depConsumerTag)
            depManager.remove(depConsumerTag);
            depTags.forEach((depTag: Tag) => {
                decorManager.remove(depTag, depConsumerTag);
            })
        })
    }

    @useLog()
    private reset(depConsumerTags: Tag[]) {
        depConsumerTags.forEach(depConsumerTag => {
            decorService.unbind(depConsumerTag);
            decorService.bind(depConsumerTag);
        })
    }
}

export const decorConsumerResolver = new DecorConsumerResolver();
