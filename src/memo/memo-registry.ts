import { Model } from "../model";
import { AbstractConstructor } from "../types";
import { depRegistry } from "../dep/dep-registry";
import { depCollector } from "../dep/dep-collector";
import { memoManager } from "../dep/dep-consumer-manager";
import { tagRegistry } from "../tag/tag-registry";
import { memoDelegator } from "./memo-delegator";

/**
 * Stores memo getter keys and installs memo dependency collection.
 */
class MemoRegistry {
    private _keys: Map<AbstractConstructor<Model>, string[]> = new Map();

    /**
     * Register a memo getter and wrap it with cache/dependency collection.
     *
     * The first getter read computes and caches the value. Dependencies read
     * during the getter are collected so `MemoResolver` can invalidate it.
     *
     * @param prototype - Prototype that owns the memo getter.
     * @param key - Memo getter key.
     * @param descriptor - Getter descriptor supplied by TypeScript.
     * @returns Nothing.
     */
    public register(prototype: Model, key: string, descriptor?: PropertyDescriptor) {
        const ctor: any = prototype.constructor;
        const keys = this._keys.get(ctor) ?? [];
        keys.push(key);
        this._keys.set(ctor, keys);

        if (!descriptor) return;
        const getter = descriptor.get;
        if (!getter) return;
        descriptor.get = function(this: Model) {
            const consumerTag = tagRegistry.query(this, key);
            if (memoDelegator.check(consumerTag)) {
                return memoDelegator.query(consumerTag);
            }
            depCollector.init(consumerTag);
            const value = getter.call(this);
            memoManager.collect(consumerTag);
            memoDelegator.update(consumerTag, value);
            return value;
        }
        depRegistry.register(prototype, key, descriptor);
    }

    /**
     * Collect inherited memo getter keys for a model.
     *
     * @param prototype - Model instance whose constructor chain is inspected.
     * @returns Memo getter keys registered on the model hierarchy.
     */
    public query(prototype: Model): string[] {
        let ctor: any = prototype.constructor;
        const memos: string[] = [];
        while (ctor) {
            const keys = this._keys.get(ctor) ?? [];
            keys.forEach(key => {
                if (memos.includes(key)) return;
                memos.push(key);
            })
            ctor = Object.getPrototypeOf(ctor);
        }
        return memos;
    }
}
export const memoRegistry = new MemoRegistry();
