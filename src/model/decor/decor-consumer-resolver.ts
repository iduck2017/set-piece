import { depManager } from "../../common/dep/dep-manager";
import { Model } from "..";
import { Tag } from "../../common/tag/tag-registry";
import { decorManager } from "../../common/dep/dep-consumer-manager";
import { decorService } from "./decor-service";
import { useMicroAction } from "../../common/action/micro-manager";

class DecorConsumerResolver {
    private _context: Set<Tag> = new Set();

    @useMicroAction()
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

    private unbind(depConsumerTags: Tag<Model>[]) {
        depConsumerTags.forEach(depConsumerTag => {
            const depTags = depManager.query(depConsumerTag)
            depManager.remove(depConsumerTag);
            depTags.forEach((depTag: Tag) => {
                decorManager.remove(depTag, depConsumerTag);
            })
        })
    }

    private reset(depConsumerTags: Tag<Model>[]) {
        depConsumerTags.forEach(depConsumerTag => {
            decorService.unbind(depConsumerTag);
            decorService.bind(depConsumerTag);
        })
    }
}

export const decorConsumerResolver = new DecorConsumerResolver();
