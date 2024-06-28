/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseConstructor } from "../types/base";
import { Exception } from "./exceptions";

const _instances = new Set<BaseConstructor>();

export function singleton(IConstructor: BaseConstructor) {
    return class extends IConstructor {
        constructor(...config: any[]) {
            if (_instances.has(IConstructor)) {
                throw new Exception();
            }
            _instances.add(IConstructor);
            super(...config);
        }
    } as any;
}
