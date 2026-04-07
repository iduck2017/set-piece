import { Model } from "../model";
import { HookRegistry } from "./hook-registry";

export const unmountHookRegistry = new HookRegistry();

export function useUnmountHook() {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<() => void>,
    ) {
        unmountHookRegistry.register(prototype, key);
    }
}
