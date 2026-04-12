import { depManager } from "../dep/dep-manager";
import { Tag } from "../tag/tag-registry";
import { useConsoleLog } from "../log/use-console-log";
import { effectManager } from "../dep/dep-consumer-manager";
import { useMacroTask } from "../task/use-macro-task";

class EffectResolver {
    private _context: Set<Tag> = new Set();

    @useMacroTask()
    public register(depTag: Tag) {
        this._context.add(depTag);
    }

    public resolve() {
        const depTags = [...this._context];
        this._context.clear();
        const depConsumerTags = effectManager.query(depTags);
        this.unbind(depConsumerTags);
        this.emit(depConsumerTags);
    }

    private unbind(depConsumerTags: Tag[]) {
        depConsumerTags.forEach(depConsumerTag => {
            const depTags = depManager.query(depConsumerTag)
            depManager.remove(depConsumerTag);
            depTags.forEach((depTag: Tag) => {
                effectManager.remove(depTag, depConsumerTag);
            })
        })
    }

    @useConsoleLog()
    private emit(depConsumerTags: Tag[]) {
        depConsumerTags.forEach(depConsumerTag => {
            const model = depConsumerTag.target;
            const key = depConsumerTag.key;
            const effect = Reflect.get(model, key);
            if (!(effect instanceof Function)) return;
            effect.call(model);
        })
    }
}

export const effectResolver = new EffectResolver();
