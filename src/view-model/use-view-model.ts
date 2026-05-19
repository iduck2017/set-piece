import { depCollector } from "../dep/dep-collector";
import { depService } from "../dep/dep-service";
import { Model } from "../model";
import { tagRegistry } from "../tag/tag-registry";
import { TypedPropertyDecorator } from "../types";
import { View } from "../view";
import { viewStorage } from "../view-child/view-storage";

export type ViewModelList = Array<Model | undefined>
export function useViewModel<
    V extends View & Record<string, any>,
    K extends string
>():
    V[K] extends Model | undefined ?
        TypedPropertyDecorator<V, K> :
        V[K] extends ViewModelList | undefined ?
            TypedPropertyDecorator<V, K> :
            TypedPropertyDecorator<never, never> {
    return function(
        prototype: V,
        key: K,
    ) {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        Object.defineProperty(prototype, key, {
            get(this: View) {
                const tag = tagRegistry.query(this, key);
                depCollector.collect(tag);
                if (descriptor?.get) return descriptor.get.call(this);
                else return viewStorage.get(this, key);
            },
            set(this: View, value) {
                const tag = tagRegistry.query(this, key);
                const prev = Reflect.get(this, key);
                if (descriptor?.set) descriptor.set.call(this, value);
                else viewStorage.set(this, key, value);
                if (prev !== value) depService.register(tag);
            },
            enumerable: true,
            configurable: true,
        });
    }
}
