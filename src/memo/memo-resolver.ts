import { depCollector } from "../dep/dep-collector";
import { depManager } from "../dep/dep-manager";
import { depService } from "../dep/dep-service";
import { useConsoleLog } from "../log/use-console-log";
import { Tag } from "../tag/tag-registry";
import { memoDelegator } from "./memo-delegator";
import { memoManager } from "../dep/dep-consumer-manager";
import { useMicroTask } from "../task/use-micro-task";

class MemoResolver {
    private _context: Set<Tag> = new Set();

    @useMicroTask()
    public register(tag: Tag) {
        this._context.add(tag);
    }

    public check() {
        return Boolean(this._context.size)
    }

    public resolve(): boolean {
        const depTags = [...this._context];
        this._context.clear();
        const consumerTags = memoManager.query(depTags);
        if (!consumerTags.length) return false;
        this.unbind(consumerTags);
        this.reset(consumerTags);
        return true;
    }

    private unbind(consumerTags: Tag[]) {
        consumerTags.forEach(consumerTag => {
            const depTags = depManager.query(consumerTag)
            depManager.remove(consumerTag);
            depTags.forEach((depTag: Tag) => {
                memoManager.remove(depTag, consumerTag);
            })
        })
    }

    @useConsoleLog()
    private reset(consumerTags: Tag[]) {
        consumerTags.forEach(consumerTag => {
            const model = consumerTag.target;
            const key = consumerTag.key;
            const prev = Reflect.get(model, key);
            memoDelegator.clear(consumerTag);
            const next = Reflect.get(model, key);
            memoDelegator.update(consumerTag, next);
            console.log('Memo update', consumerTag.name, prev, next);
            if (prev !== next) {
                console.log(`Memo changed: ${consumerTag.name} ${prev} ${next}`);
                depService.register(consumerTag);
            }
        })
    }
}

export const memoResolver = new MemoResolver();
