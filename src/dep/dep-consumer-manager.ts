import { depCollector } from "./dep-collector";
import { depManager } from "./dep-manager";
import { Tag } from "../tag/tag-registry";

export class DepConsumerManager {
    private _context: WeakMap<Tag, Tag[]> = new WeakMap();

    /**
     * Find all consumers affected by one or more changed dependency tags.
     *
     * This forward map is queried by resolvers after reactive state changes.
     *
     * @param arg - One changed dependency tag or a list of changed tags.
     * @returns Unique consumer tags that depend on the changed dependency tags.
     */
    public query(depTag: Tag): Tag[]
    public query(depTags: Tag[]): Tag[]
    public query(arg: Tag | Tag[]): Tag[] {
        if (!(arg instanceof Array)) return this.query([arg]);
        const result: Tag[] = [];
        arg.forEach((depTag) => {
            const consumerTags = this._context.get(depTag);
            consumerTags?.forEach(consumerTag => {
                if (result.includes(consumerTag)) return;
                result.push(consumerTag);
            })
        })
        return result;
    }

    /**
     * Connect one dependency tag to one consumer tag.
     *
     * @param depTag - Dependency tag read by a consumer.
     * @param depConsumerTag - Consumer tag that read the dependency.
     * @returns Nothing.
     */
    public add(depTag: Tag, depConsumerTag: Tag) {
        const consumerTags = this._context.get(depTag) ?? [];
        if (consumerTags.includes(depConsumerTag)) return;
        consumerTags.push(depConsumerTag);
        this._context.set(depTag, consumerTags);
    }

    /**
     * Remove one consumer from a dependency or clear the dependency entry.
     *
     * @param depTag - Dependency tag whose consumers should be updated.
     * @param depConsumerTag - Optional consumer to remove. When omitted, all
     * consumers for the dependency are removed.
     * @returns Nothing.
     */
    public remove(depTag: Tag, depConsumerTag?: Tag) {
        if (!depConsumerTag) return this._context.delete(depTag);
        const consumerTags = this._context.get(depTag) ?? [];
        const index = consumerTags.indexOf(depConsumerTag);
        if (index === -1) return;
        consumerTags.splice(index, 1);
        this._context.set(depTag, consumerTags);
    }

    /**
     * Commit collected dependencies into both forward and reverse maps.
     *
     * This is called after a consumer loader, memo getter, effect, or decor
     * handler finishes and the collector has recorded its reads.
     *
     * @param depConsumerTag - Consumer tag whose collected dependencies commit.
     * @returns Nothing.
     */
    public collect(depConsumerTag: Tag) {
        const depTags = depCollector.query(depConsumerTag);
        const index = depTags.indexOf(depConsumerTag);
        if (index >= 0) depTags.splice(index, 1);
        depTags.forEach(depTag => {
            this.add(depTag, depConsumerTag);
            depManager.add(depConsumerTag, depTag);
        })
        depCollector.clear(depConsumerTag);
    }
}

export const eventManager = new DepConsumerManager();
export const memoManager = new DepConsumerManager();
export const effectManager = new DepConsumerManager();
export const decorManager = new DepConsumerManager();
export const frameManager = new DepConsumerManager();
