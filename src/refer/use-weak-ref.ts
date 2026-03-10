import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { getDescriptor } from "../utils/get-descriptor";
import { useRef } from "./use-ref";

type WeakRefMap = Map<string, Model[]>;

export const weakRefContext = new WeakMap<Model, WeakRefMap>();

export function connectWeakRef(source: Model, key: string, targets: Model[]) {
    targets.forEach(target => {
        const refsMap: WeakRefMap = weakRefContext.get(target) ?? new Map();
        const refs: Model[] = refsMap.get(key) ?? [];
        refs.push(source);
        refsMap.set(key, refs);
        weakRefContext.set(target, refsMap);
    });
}

export function unconnectWeakRef(source: Model, key: string, targets: Model[]) {
    targets.forEach(target => {
        const refsMap: WeakRefMap = weakRefContext.get(target) ?? new Map();
        const refs: Model[] = refsMap.get(key) ?? [];
        const index = refs.indexOf(source);
        if (index === -1) return;
        refs.splice(index, 1);
        refsMap.set(key, refs);
        weakRefContext.set(target, refsMap);
    });
}

export function unbindWeakRef(target: Model) {
    const refsMap: WeakRefMap = weakRefContext.get(target) ?? new Map();
    refsMap.forEach((refs, key) => {
        refs.forEach(ref => {
            if (ref.root !== target.root) {
                Reflect.set(ref, key, undefined);
            }
        });
    })
}


export const weakRefRegistry = new Map<Function, string[]>();

export function useWeakRef<
    M extends Model & Record<string, any>,
    K extends string
>(): 
    M[K] extends Model | undefined ? 
        undefined extends M[K] ? 
        TypedPropertyDecorator<M, K> :
        TypedPropertyDecorator<never, never> :
        TypedPropertyDecorator<never, never> {
    return function(
        prototype: M,
        key: K,
    ) {
        const constructor = prototype.constructor;
        const refKeys = weakRefRegistry.get(constructor) ?? [];
        refKeys.push(key);
        weakRefRegistry.set(constructor, refKeys);

        const { setter, getter } = getDescriptor(prototype, key);
        Object.defineProperty(prototype, key, {
            get() {
                return getter.call(this);
            },
            set(this: Model, value) {
                const prev: unknown = Reflect.get(this, key);
                setter.call(this, value);
                const next: unknown = Reflect.get(this, key);
                if (prev instanceof Model) unconnectWeakRef(this, key, [prev]);
                if (next instanceof Model) connectWeakRef(this, key, [next]);
            },
            enumerable: true,
            configurable: true,
        });
    }
}

