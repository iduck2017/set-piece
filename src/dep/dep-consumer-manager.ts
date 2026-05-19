import { depCollector } from "./dep-collector";
import { depManager } from "./dep-manager";
import { Tag } from "../tag/tag-registry";
import type { Model } from "../model";
import type { View } from "../view";

export class DepConsumerManager<C extends Model | View = Model | View> {
    private _context: WeakMap<Tag, Tag<C>[]> = new WeakMap();

    public query(depTag: Tag): Tag<C>[]
    public query(depTags: Tag[]): Tag<C>[]
    public query(arg: Tag | Tag[]): Tag<C>[] {
        if (!(arg instanceof Array)) return this.query([arg]);
        const result: Tag<C>[] = [];
        arg.forEach((depTag) => {
            const consumerTags = this._context.get(depTag);
            consumerTags?.forEach(consumerTag => {
                if (result.includes(consumerTag)) return;
                result.push(consumerTag);
            })
        })
        return result;
    }

    public add(depTag: Tag, depConsumerTag: Tag<C>) {
        const consumerTags = this._context.get(depTag) ?? [];
        if (consumerTags.includes(depConsumerTag)) return;
        consumerTags.push(depConsumerTag);
        this._context.set(depTag, consumerTags);
    }

    public remove(depTag: Tag, depConsumerTag?: Tag<C>) {
        if (!depConsumerTag) return this._context.delete(depTag);
        const consumerTags = this._context.get(depTag) ?? [];
        const index = consumerTags.indexOf(depConsumerTag);
        if (index === -1) return;
        consumerTags.splice(index, 1);
        this._context.set(depTag, consumerTags);
    }

    public collect(depConsumerTag: Tag<C>) {
        const depTags = depCollector.query(depConsumerTag);
        const index = depTags.indexOf(depConsumerTag);
        if (index >= 0) depTags.splice(index, 1);
        // console.log(`Deps collect: ${depConsumerTag.name} -> ${depTags.map(dep => dep.name).join(', ')}`)
        depTags.forEach(depTag => {
            this.add(depTag, depConsumerTag);
            depManager.add(depConsumerTag, depTag);
        })
        depCollector.clear(depConsumerTag);
    }
}

export const eventManager = new DepConsumerManager<Model>();
export const memoManager = new DepConsumerManager<Model>();
export const effectManager = new DepConsumerManager<Model>();
export const deferEffectManager = new DepConsumerManager<Model>();
export const decorManager = new DepConsumerManager<Model>();
export const frameManager = new DepConsumerManager<View>();
