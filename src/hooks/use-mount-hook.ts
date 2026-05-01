import { Model } from "../model";
import { HookRegistry } from "./hook-registry";

export const mountHookRegistry = new HookRegistry();

export function useMountHook() {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<() => void>,
    ) {
        mountHookRegistry.register(prototype, key);
    }
}
