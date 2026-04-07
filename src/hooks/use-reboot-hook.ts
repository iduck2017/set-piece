import { Model } from "../model";
import { HookRegistry } from "./hook-registry";

export const rebootHookRegistry = new HookRegistry();

export function useRebootHook() {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<() => void>,
    ) {
        rebootHookRegistry.register(prototype, key);
    }
}
