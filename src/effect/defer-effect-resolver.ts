import { depManager } from "../dep/dep-manager";
import { Tag } from "../tag/tag-registry";
import { deferEffectManager } from "../dep/dep-consumer-manager";
import { useAction } from "../action/use-action";

class DeferEffectResolver {
    private _context: Set<Tag> = new Set();

    @useAction()
    public register(depTag: Tag) {
        this._context.add(depTag);
    }

    public check() {
        return Boolean(this._context.size);
    }

    public resolve() {
        const depTags = [...this._context];
        this._context.clear();
        const depConsumerTags = deferEffectManager.query(depTags);
        this.unbind(depConsumerTags);
        this.emit(depConsumerTags);
    }

    private unbind(depConsumerTags: Tag[]) {
        depConsumerTags.forEach(depConsumerTag => {
            const depTags = depManager.query(depConsumerTag)
            depManager.remove(depConsumerTag);
            depTags.forEach((depTag: Tag) => {
                deferEffectManager.remove(depTag, depConsumerTag);
            })
        })
    }

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

export const deferEffectResolver = new DeferEffectResolver();
